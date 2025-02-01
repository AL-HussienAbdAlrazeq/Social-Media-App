import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const signupValidation = joi
  .object()
  .keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword
      .valid(joi.ref("password"))
      .required(),
  })
  .required();

export const confirmEmailValidation = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
  })
  .required();

export const loginValidation = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();

export const forgetPasswordValidation = joi
  .object()
  .keys({
    email: generalFields.email.required(),
  })
  .required();


  export const  validateForgetPasswordValidation = confirmEmailValidation


  export const resetPasswordValidation =  joi
  .object()
  .keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword
      .valid(joi.ref("password"))
      .required(),
  })
  .required();
