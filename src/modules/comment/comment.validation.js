import joi from "joi"
import { generalFields } from "../../middleware/validation.middleware.js"


export const createCommentValidation = joi.object().keys({
    commentId: generalFields.id,
    postId: generalFields.id.required(),
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        finalPath: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number(),
    })
}).or('content', 'file')


export const updateCommentValidation = joi.object().keys({
    commentId: generalFields.id.required(),
    postId: generalFields.id.required(),
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        finalPath: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number(),
    })
}).or('content', 'file')



export const freezeCommentValidation = joi.object().keys({
    commentId: generalFields.id.required(),
    postId: generalFields.id.required()
})

export const unFreezeCommentValidation = joi.object().keys({
    commentId: generalFields.id.required(),
    postId: generalFields.id.required()
})

export const likePostValidation = joi.object().keys({
    action: joi.string(),
    id: generalFields.id.required()
})