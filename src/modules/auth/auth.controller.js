import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import {
  confirmEmailValidation,
  forgetPasswordValidation,
  loginValidation,
  resetPasswordValidation,
  signupValidation,
  validateForgetPasswordValidation,
} from "./auth.validation.js";
import {
  confirmEmail,
  confirmLogin,
  forgetPassword,
  login,
  loginWithGmail,
  refreshToken,
  resetPassword,
  signup,
  validForgetPassword,
} from "./service/auth.service.js";

const authRouter = Router();

authRouter.post("/signup", validation(signupValidation), signup);
authRouter.post(
  "/confirm-email",
  validation(confirmEmailValidation),
  confirmEmail
);
authRouter.post("/login", validation(loginValidation), login);
authRouter.post("/login-with-gmail", loginWithGmail);

authRouter.get("/refresh-token", refreshToken);
authRouter.patch(
  "/forget-password",
  validation(forgetPasswordValidation),
  forgetPassword
);
authRouter.patch(
  "/valid-forget-password",
  validation(validateForgetPasswordValidation),
  validForgetPassword
);
authRouter.patch(
  "/reset-password",
  validation(resetPasswordValidation),
  resetPassword
);

authRouter.post('/confirm-login' , confirmLogin)

export default authRouter;
