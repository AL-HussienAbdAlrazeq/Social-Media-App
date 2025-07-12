import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileTypes } from "../../utils/multer/local.multer.js";
import {
  blockUser,
  changeRole,
  dashboard,
  profile,
  shareProfile,
  twoStepVerification,
  updatePassword,
  updateProfile,
  updateProfileCoverImages,
  updateProfileImage,
  verifyTwoStepOTP,
} from "./service/user.service.js";
import {
  blockUserValidation,
  profileImage,
  shareProfileValidation,
  updatePasswordValidation,
  updateProfileValidation,
} from "./user.validation.js";
import { endPoint } from "./user.authorized.js";

const userRouter = Router();
userRouter.get("/profile", authentication(), profile);
userRouter.get("/profile/dashboard", authentication(), authentication(endPoint.changeRole), dashboard);
userRouter.patch("/:userId/profile/dashboard/role", authentication(), authentication(endPoint.changeRole), changeRole);


userRouter.get(
  "/share-profile/:profileId",
  validation(shareProfileValidation),
  authentication(),
  shareProfile
);

userRouter.patch('/update-profile', validation(updateProfileValidation), authentication(), updateProfile)
userRouter.patch(
  '/update-profile-image',
  authentication(),
  uploadCloudFile(fileTypes.image).single('image'),
  validation(profileImage),
  updateProfileImage)


userRouter.patch(
  '/update-profile-image/cover',
  authentication(),
  uploadCloudFile(fileTypes.image).array('image', 4),
  updateProfileCoverImages)

userRouter.patch(
  "/update-password",
  validation(updatePasswordValidation),
  authentication(),
  updatePassword
);

userRouter.post('/two-step-enable', authentication(), twoStepVerification)
userRouter.post('/verify-two-step-otp', authentication(), verifyTwoStepOTP)
userRouter.post('/block-user', validation(blockUserValidation), authentication(), blockUser)
export default userRouter;
