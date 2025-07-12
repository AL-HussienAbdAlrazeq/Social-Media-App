import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
export const shareProfileValidation = joi
  .object()
  .keys({ profileId: generalFields.id.required() })
  .required();

export const updatePasswordValidation = joi
  .object()
  .keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmationPassword: generalFields.confirmationPassword
      .valid(joi.ref("password"))
      .required(),
  })
  .required();
export const updateProfileValidation = joi
  .object()
  .keys({
    username: generalFields.username,
    DOB: generalFields.DOB,
    phone: generalFields.phone,
    gender: generalFields.gender,
    address: generalFields.address,
  })
  .required();

export const verifyOTPValidation = joi
  .object()
  .keys({
    otp: generalFields.code.required(),
  })
  .required();


  export const blockUserValidation = joi
  .object()
  .keys({
    emailToBlock:generalFields.email.required()
  })
  .required();


  export const profileImage = joi.object().keys({
    file:joi.object().keys({
      fieldname: joi.string(),
      originalname: joi.string(),
      encoding:joi.string(),
      mimetype: joi.string(),
      finalPath: joi.string(),
      destination: joi.string(),
      filename: joi.string(),
      path: joi.string(),
      size: joi.number(),
    }).required()
  }).required()