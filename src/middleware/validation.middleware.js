import joi from "joi";
import { Types } from "mongoose";
import { genderTypes } from "../Database/models/user.model.js";

export const isValidObject = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("In-valid object");
};

export const generalFields = {
  username: joi.string().min(3).max(100).trim(),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ),
  confirmationPassword: joi.string(),
  code: joi.string().pattern(new RegExp(/^\d{4}$/)),
  id: joi.string().custom(isValidObject),
  DOB: joi.date().less("now"),
  gender: joi.string().valid(...Object.values(genderTypes)),
  address: joi.string(),
  phone: joi.string().pattern(new RegExp(/^(01[0-2,5,9][0-9]{8}|0[2-9][0-9]{7,8})$/)),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputs = { ...req.body, ...req.params, ...req.query };
    const validationResult = schema.validate(inputs, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).json({
        message: "validation error",
        details: validationResult.error.details,
      });
    }
    return next();
  };
};
