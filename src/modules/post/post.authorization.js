import { roleTypes } from "../../Database/models/user.model.js";


export const endPoint = {
    createPost:[roleTypes.user],
    freezePost:[roleTypes.user,roleTypes.admin],
    likePost:[roleTypes.user,roleTypes.admin]

}