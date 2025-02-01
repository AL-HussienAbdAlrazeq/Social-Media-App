import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import {
  blockUser,
  profile,
  shareProfile,
  twoStepVerification,
  updatePassword,
  updateProfile,
  updateProfileCoverImages,
  updateProfileImage,
  verifyTwoStepOTP,
} from "./service/user.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  blockUserValidation,
  shareProfileValidation,
  updatePasswordValidation,
  updateProfileValidation,
} from "./user.validation.js";
import { fileTypes, uploadDiskFile } from "../../utils/multer/local.multer.js";

const userRouter = Router();
userRouter.get("/profile", authentication(), profile);
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
  uploadDiskFile('user/profile', fileTypes.image).single('image'),
  updateProfileImage)


  userRouter.patch(
    '/update-profile-image/cover',
    authentication(),
    uploadDiskFile('user/profile', fileTypes.image).array('image',3),
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
