import { EventEmitter } from "node:events";
import { customAlphabet } from "nanoid";
import { generateHash } from "../security/hash.security.js";
import User from "../../Database/models/user.model.js";
import { verifyAccountTemplate } from "../template/verifyAccount.template.js";
import { sendEmail } from "../email/sendEmail.js";
export const emailEvent = new EventEmitter();

const emailSubject = {
  confirmEmail: "Confirm-Email",
  resetPassword: "Forget-Password",
  shareProfile: "Views",
  twoStepVerification: "2-Step-Verification",
};

export const sendCode = async ({
  data = {},
  subject = emailSubject.confirmEmail,
} = {}) => {
  const { id, email } = data;
  const otp = customAlphabet("0123456789", 4)();
  const hashOTP = generateHash({ plainText: otp });
  let updateData = {};
  switch (subject) {
    case emailSubject.confirmEmail:
      updateData = { confirmEmailOTP: hashOTP };
      break;
    case emailSubject.resetPassword:
      updateData = { resetPasswordOTP: hashOTP };
      break;
    default:
      break;
  }
  await User.updateOne({ _id: id }, updateData);

  const html = verifyAccountTemplate({ code: otp });
  await sendEmail({ to: email, subject, html });
};

emailEvent.on("sendConfirmEmail", async (data) => {
  await sendCode({ data });
});

emailEvent.on("forgetPassword", async (data) => {
  await sendCode({ data, subject: emailSubject.resetPassword });
});


emailEvent.on("twoStepVerification", async (data) => {
  const { email } = data;
  const otp = customAlphabet("0123456789", 4)();
  const html = verifyAccountTemplate({ code: otp });
  const twoStepVerOTP = generateHash({ plainText: otp });
  const twoStepExpiry = Date.now(Date.now() + 5 * 60 * 1000);
  await User.updateOne(
    { email },
    {
      twoStepVerificationOTP: twoStepVerOTP,
      twoStepVerificationOTPExpiry: twoStepExpiry,
    }
  );
  await sendEmail({to:email , subject:emailSubject.twoStepVerification , html})
});

emailEvent.on("shareProfile", async (data) => {
  const { email, watcherName, times } = data;
  const text = `${watcherName} has viewed your account 5 times at these time periods:[${times}]`;
  await sendEmail({ to: email, subject: emailSubject.shareProfile, text });
});
