

import User from "../../Database/models/user.model.js";
import { verifyToken } from "../../utils/security/token.security.js";

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};

export const access_Roles = {
  user: "user",
  admin: "admin",
};

export const authentication = async ({
  socket = {},
  tokenType = tokenTypes.access,

} = {}) => {
  const [bearer, token] = socket.handshake?.auth?.authorization?.split(" ");
  if (!bearer || !token) {
    return {data:{message:"Missing Token" , status:400}};
  }
  let access_signature = "";
  let refresh_signature = "";

  switch (bearer) {
    case "System":
      access_signature = process.env.ADMIN_ACCESS_TOKEN;
      refresh_signature = process.env.ADMIN_REFRESH_TOKEN;
      break;
    case "Bearer":
      access_signature = process.env.USER_ACCESS_TOKEN;
      refresh_signature = process.env.USER_REFRESH_TOKEN;
      break;

    default:
      break;
  }
  const decode = verifyToken({
    token,
    signature:
      tokenType == tokenTypes.access ? access_signature : refresh_signature,
  });
  if (!decode?.id) {
    return {data:{message:"In-Valid token payload", status:401}};
  }
  const user = await User.findOne({ _id: decode.id, isDeleted: { $exists: false } });
  if (!user) {
    return {data:{message:"Not register account", status:404}};
  }
  if (user.changeCredentialTimes?.getTime() >= decode.iat * 1000) {
    return {data:{message:"In-valid login credentials"}};
  }
  return {data:{message:"Done" , user} , valid:true};
};
