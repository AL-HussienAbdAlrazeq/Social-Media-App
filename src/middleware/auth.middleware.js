import User from "../Database/models/user.model.js";
import { asyncHandler } from "../utils/response/error.response.js";
import { decodedToken } from "../utils/security/token.security.js";

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodedToken({ authorization, next });
    req.user = user;
    return next();
  });
};

export const authorization = (access_Roles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!access_Roles.includes(req.user.role)) {
      return next(new Error("Not Authorized Account", { cause: 403 }));
    }
    return next();
  });
};
