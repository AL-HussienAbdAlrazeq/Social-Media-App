import User from "../../../Database/models/user.model.js";
import { sendEmail } from "../../../utils/email/sendEmail.js";
import { emailEvent } from "../../../utils/event/emailEvent.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";

export const profile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id }).populate([
    {
      path: "viewers.userId",
    },
  ]);
  return successResponse({ res, data: { user } });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate({ _id: req.user._id }, req.body, {
    new: true,
  }).populate([
    {
      path: "viewers.userId",
    },
  ]);
  return successResponse({ res, data: { user } });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  let user = null;
  if (profileId === req.user._id.toString()) {
    user = req.user;
  } else {
    user = await User.findOneAndUpdate(
      { _id: profileId, isDeleted: false },
      { $push: { viewers: { userId: req.user._id, time: Date.now() } } }
    );
  }
  if (!user) {
    return next(new Error("Invalid account", { cause: 404 }));
  }

  if (user.viewers.length > 5) {
    user.viewers.shift();
  }
  await user.save();
  const userView = user.viewers.filter(
    (v) => v.userId.toString() === req.user._id.toString()
  );

  if (userView.length === 5) {
    const date = userView.map((d) => d.time);

    emailEvent.emit("shareProfile", {
      email: user.email,
      watcherName: req.user.username,
      times: date,
    });
  }

  return successResponse({ res, data: { user } });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;
  if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
    return next(new Error("In-valid Old Password", { cause: 400 }));
  }
  await User.updateOne(
    { _id: req.user._id },
    {
      password: generateHash({ plainText: password }),
      changeCredentialTimes: Date.now(),
    }
  );
  return successResponse({ res, data: {} });
});

export const twoStepVerification = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findOne(userId);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  emailEvent.emit("twoStepVerification", { id: userId, email: user.email });
  return successResponse({ res, data: {} });
});

export const verifyTwoStepOTP = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { otp } = req.body;
  const user = await User.findOne(userId);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (
    !compareHash({ plainText: otp, hashValue: user.twoStepVerificationOTP })
  ) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }
  const { email } = user;
  await User.updateOne(
    { email },
    { twoStepVerification: true, $unset: { twoStepVerificationOTP: 0 } }
  );
  return successResponse({ res, data: {} });
});

export const blockUser = asyncHandler(async (req, res, next) => {
  const { emailToBlock } = req.body
  const currentUserId = req.user._id
  const userToBlock = await User.findOne({ email: emailToBlock })
  if (!userToBlock) {
    return next(new Error("User to block not found"))
  }
  const currentUser = await User.findById(currentUserId)
  if (currentUser.blockedUsers.includes(userToBlock._id)) {
    return next(new Error("User Already Blocked"))
  }
  currentUser.blockedUsers.push(userToBlock._id)
  await currentUser.save()
  return successResponse({ res, data: {} });
});


export const updateProfileImage = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { image: req.file.finalPath },
    { new: true }
  )
  return successResponse({ res, data: { file: req.file } });
});

export const updateProfileCoverImages = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { coverImages: req.files.map(file=>file.finalPath) },
    { new: true }
  )
  return successResponse({ res, data: { user } });
});

