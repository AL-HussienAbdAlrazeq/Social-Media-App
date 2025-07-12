import { Router } from "express"
import { authentication, authorization } from "../../middleware/auth.middleware.js"
import { validation } from "../../middleware/validation.middleware.js"
import { fileTypes, uploadCloudFile } from "../../utils/multer/cloud.multer.js"
import { endPoint } from "./post.authorization.js"
import { createPostValidation, freezePostValidation, likePostValidation, unFreezePostValidation, updatePostValidation } from "./post.validation.js"
import { createPost, findAllPosts, freezePost, likePost, unFreezePost, updatePost } from "./service/post.service.js"
import commentRouter from "../comment/comment.controller.js"

const postRouter = Router()
postRouter.use('/:postId/comment', commentRouter)
postRouter.post('/',
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileTypes.image).array('attachment', 3),
    validation(createPostValidation),
    createPost
)

postRouter.get('/',
    findAllPosts
)


postRouter.patch('/:id',
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileTypes.image).array('attachment', 3),
    validation(updatePostValidation),
    updatePost
)


postRouter.delete('/:id',
    authentication(),
    authorization(endPoint.freezePost),
    validation(freezePostValidation),
    freezePost
)


postRouter.patch('/:id/restore',
    authentication(),
    authorization(endPoint.freezePost),
    validation(unFreezePostValidation),
    unFreezePost
)

postRouter.patch('/:id/like',
    authentication(),
    authorization(endPoint.likePost),
    validation(likePostValidation),
    likePost
)


export default postRouter