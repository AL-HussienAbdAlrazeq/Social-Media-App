import { Router } from "express"
import { authentication, authorization } from "../../middleware/auth.middleware.js"
import { validation } from "../../middleware/validation.middleware.js"
import { fileTypes, uploadCloudFile } from "../../utils/multer/cloud.multer.js"
import { endPoint } from "./comment.authorization.js"
import { createCommentValidation, freezeCommentValidation, unFreezeCommentValidation, updateCommentValidation } from "./comment.validation.js"
import { createComment, freezeComment, unFreezeComment, updateComment } from "./service/comment.service.js"


const commentRouter = Router({ mergeParams: true })
commentRouter.post('/:commentId?',
    authentication(),
    authorization(endPoint.createComment),
    uploadCloudFile(fileTypes.image).array('attachment', 2),
    validation(createCommentValidation),
    createComment
)




commentRouter.patch('/:commentId',
    authentication(),
    authorization(endPoint.updateComment),
    uploadCloudFile(fileTypes.image).array('attachment', 2),
    validation(updateCommentValidation),
    updateComment
)


commentRouter.delete('/:commentId/freeze',
    authentication(),
    authorization(endPoint.freezeComment),
    validation(freezeCommentValidation),
    freezeComment
)


commentRouter.patch('/:commentId/unfreeze',
    authentication(),
    authorization(endPoint.freezeComment),
    validation(unFreezeCommentValidation),
    unFreezeComment
)

// commentRouter.patch('/:id/like',
//     authentication(),
//     authorization(endPoint.likePost),
//     validation(likePostValidation),
//     likePost
// )


export default commentRouter