import Comment from "../../../Database/models/comment.model.js";
import Post from "../../../Database/models/post.model.js";
import { roleTypes } from "../../../Database/models/user.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const createComment = asyncHandler(async (req, res, next) => {
    const { postId , commentId } = req.params
    if(commentId && !await Comment.findOne({_id:commentId , postId , isDeleted:{$exists:false}})){
           return next(new Error("In-Valid comment parent"))
    }

    const post = await Post.findById(postId)


    if (!post) {
        return next(new Error("Post Not Found", { cause: 404 }))
    }
    if (req.files?.length) {
        let attachments = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path,
                { folder: `Social_Media/user/${post.createdBy}/post/${postId}/comments` }
            )
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }


    const comment = await Comment.create({ ...req.body, postId, commentId,createdBy: req.user._id })
    return successResponse({ res, data: { comment } });
});



export const updateComment = asyncHandler(async (req, res, next) => {
    const { postId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
        return next(new Error("Post Not Found", { cause: 404 }))
    }
    let attachments = []
    if (req.files?.length) {
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "Social_Media/posts" })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }


    const comment = await Comment.findOneAndUpdate(
        { _id: req.params.commentId, isDeleted: { $exists: false }, createdBy: req.user._id },
        { ...req.body, updatedBy: req.user._id },
        { new: true }).populate("postId")
    return post ? successResponse({ res, status: 200, data: { comment } }) : next(new Error("Comment not found", { cause: 404 }))

});


export const freezeComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params
    const comment = await Comment.findOne({ _id: commentId, postId, isDeleted: { $exists: false } })
    if (!comment ||
        comment.createdBy.toString() !== req.user._id.toString()
        &&
        comment.postId.createdBy.toString() !== req.user._id.toString()
        &&
        req.user.role !== roleTypes.admin
    ) {
        return next(new Error("In-valid comment ID", { cause: 404 }))
    }


    const saveComment = await Comment.findOneAndUpdate(
        { _id: commentId, isDeleted: { $exists: false } },
        { isDeleted: Date.now(), updatedBy: req.user._id, deletedBy: req.user._id },
        { new: true }
    )
    return saveComment ? successResponse({ res, status: 200, data: { saveComment } }) : next(new Error("Comment not found", { cause: 404 }))
});


export const unFreezeComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params
    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, postId, isDeleted: { $exists: true }, deletedBy: req.user._id },
        { $unset: { isDeleted: 0, deletedBy: 0 }, updatedBy: req.user._id },
        { new: true }
    )
    
    return  successResponse({ res, status: 200, data: { comment } })
});


export const likeComment = asyncHandler(async (req, res, next) => {
    const data = req.query.action === "unlike" ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
    const { id } = req.params
    const post = await Comment.findOneAndUpdate(
        { _id: id, isDeleted: { $exists: false } },
        data,
        { new: true }
    )
    return post ? successResponse({ res, status: 200, data: { post } }) : next(new Error("Post not found", { cause: 404 }))
});
