import { roleTypes } from "../../Database/models/user.model.js";

export const endPoint = {
    changeRole: [roleTypes.superAdmin, roleTypes.admin]
}