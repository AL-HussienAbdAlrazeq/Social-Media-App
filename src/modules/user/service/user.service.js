import Post from "../../../Database/models/post.model.js";
import User, { roleTypes } from "../../../Database/models/user.model.js";
import { emailEvent } from "../../../utils/event/emailEvent.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";

export const dashboard = asyncHandler(async (req, res, next) => {

  const result = await Promise.allSettled([
    await User.find({ _id: req.user._id }).populate([
      {
        path: "viewers.userId",
      },
    ]),
    await Post.find()
  ])

  return successResponse({ res, data: { result } });
});

export const changeRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body
  const { userId } = req.params

  const roles = req.user.role === roleTypes.superAdmin
    ? { role: { $nin: [roleTypes.superAdmin] } }
    : { role: { $nin: [roleTypes.admin, roleTypes.superAdmin] } }

  const user = await User.findOneAndUpdate(
    { _id: userId, isDeleted: { $exists: false }, ...roles },
    { role, updatedBy: req.user._id },
    { new: true }
  )
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found or unauthorized update" });
  }
  return successResponse({ res, data: { user } });
});


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
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: "Social_Media/users" })
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { image: { secure_url, public_id } },
    { new: false }
  )
  if (user.image?.public_id) {
    await cloud.uploader.destroy(user.image?.public_id)
  }
  return successResponse({ res, data: { file: req.file } });
});

export const updateProfileCoverImages = asyncHandler(async (req, res, next) => {
  let images = []
  for (const file of req.files) {
    const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "Social_Media/users/cover" })
    images.push({ secure_url, public_id })
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { coverImages: images },
    { new: false }
  )

  return successResponse({ res, data: { user } });
});

