import User, {
  providerTypes,
  roleTypes,
} from "../../../Database/models/user.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { emailEvent } from "../../../utils/event/emailEvent.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  decodedToken,
  generateToken,
  tokenTypes,
  verifyToken,
} from "../../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";

export const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (await User.findOne({ email })) {
    return next(new Error("Email Exist", { cause: 409 }));
  }
  const hashPassword = generateHash({ plainText: password });
  const user = await User.create({ username, email, password: hashPassword });
  emailEvent.emit("sendConfirmEmail", { id: user._id, email });
  return successResponse({ res, status: 201, message: "Done" });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.confirmEmail) {
    return next(new Error("Already Verified", { cause: 409 }));
  }
  if (!compareHash({ plainText: code, hashValue: user.confirmEmailOTP })) {
    return next(new Error("Invalid Code ", { cause: 400 }));
  }
  const codeExpiry = new Date(Date.now() + 2 * 60 * 1000);
  user.codeExpiry = codeExpiry;
  await user.save();
  await User.updateOne(
    { email },
    { confirmEmail: true, $unset: { confirmEmailOTP: 0 } }
  );
  return successResponse({ res, status: 200, message: "Done" });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, provider: providerTypes.system });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please  Verify your account first", { cause: 409 }));
  }
  if (!compareHash({ plainText: password, hashValue: user.password })) {
    return next(new Error("Invalid Account ", { cause: 400 }));
  }
  if(user.twoStepVerification){
    emailEvent.emit("twoStepVerification" , {id:user._id , email:user.email})
    return successResponse({res , status:201 , message:"The OTP is sent to your email", data:{}})
  }
  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 31536000,
  });

  return successResponse({
    res,
    status: 200,
    message: "Done",
    data: { token: { access_token, refresh_token } },
  });
});

export const confirmLogin = asyncHandler(async (req, res, next) => {
  
  const {otp , email} = req.body
  const user = await User.findOne({email})
  if(!user){
    return next(new Error("User not found", { cause: 404 }));
  }
  if(!compareHash({plainText:otp , hashValue:user.twoStepVerificationOTP}) ){
    return next(new Error("Invalid OTP ", { cause: 400 }));
  }
  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 31536000,
  });

  return successResponse({
    res,
    status: 200,
    message: "Done",
    data: { token: { access_token, refresh_token } },
  });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const payload = await verify();
  if (!payload.email_verified) {
    return next(new Error("Invalid Account", { cause: 400 }));
  }
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    await User.create({
      username: payload.name,
      email: payload.email,
      confirmEmail: payload.email_verified,
      provider: providerTypes.google,
      image: payload.picture,
    });
  }

  if (user.provider !== providerTypes.google) {
    return next(new Error("Invalid provider", { cause: 400 }));
  }

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 31536000,
  });

  return successResponse({
    res,
    status: 200,
    message: "Done",
    data: { token: { access_token, refresh_token } },
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.refresh,
    next,
  });

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 31536000,
  });

  return successResponse({
    res,
    status: 200,
    message: "Done",
    data: { token: { access_token, refresh_token } },
  });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email }, { isDeleted: false });
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: 404 }));
  }
  const codeExpiry = new Date(Date.now() + 2 * 60 * 1000);
  user.codeExpiry = codeExpiry;
  user.failedAttempts = 0;
  await user.save();
  emailEvent.emit("forgetPassword", { id: user._id, email });

  return successResponse({ res, status: 200, message: "Done" });
});

export const validForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email }, { isDeleted: false });
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: 404 }));
  }

  if (!compareHash({ plainText: code, hashValue: user.resetPasswordOTP })) {
    return next(new Error("In-valid OTP", { cause: 404 }));
  }

  return successResponse({ res, status: 200, message: "Done" });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await User.findOne({ email }, { isDeleted: false });
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: 404 }));
  }
  if (!user.resetPasswordOTP || user.codeExpiry < new Date()) {
    return next(new Error("Code Expiry", { cause: 400 }));
  }
  if (user.resetPasswordOTP !== code) {
    user.failedAttempts += 1;
    await user.save();
    return next(new Error("Invalid verification code", { cause: 400 }));
  }
  if (!compareHash({ plainText: code, hashValue: user.resetPasswordOTP })) {
    return next(new Error("In-valid OTP", { cause: 404 }));
  }

  await User.updateOne(
    { email },
    {
      password: generateHash({ plainText: password }),
      changeCredentialTimes: Date.now(),
      $unset: {
        resetPasswordOTP: 0,
      },
    }
  );
  return successResponse({ res, status: 200, message: "Done" });
});
