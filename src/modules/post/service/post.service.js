import Post from "../../../Database/models/post.model.js";
import { roleTypes } from "../../../Database/models/user.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const createPost = asyncHandler(async (req, res, next) => {
    const { content } = req.body
    let attachments = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "Social_Media/posts" })
        attachments.push({ secure_url, public_id })
    }

    const post = await Post.create({ content, attachments, createdBy: req.user._id })
    return successResponse({ res, data: { post } });
});

export const findAllPosts = asyncHandler(async (req, res, next) => {

    let { page = process.env.PAGE, size = process.env.SIZE } = req.query;
    page = Math.max(1, parseInt(page));
    size = Math.max(1, parseInt(size));
    const skip = (page - 1) * size;
    const baseQuery = { isDeleted: { $exists: false } };
    const count = await Post.countDocuments(baseQuery);
    const posts = await Post.find(baseQuery)
        .skip(skip)
        .limit(size)
        .populate({
            path: "comments",
            match: {
                isDeleted: { $exists: false },
                commentId: { $exists: false } // Only parent comments
            },
            populate: {
                path: 'reply',
                match: {
                    isDeleted: { $exists: false }
                }
            }
        });

    return successResponse({
        res,
        data: {
            posts,
            page,
            size,
            count,
            totalPages: Math.ceil(count / size)
        }
    });
});

export const updatePost = asyncHandler(async (req, res, next) => {
    let attachments = []
    if (req.files.length) {
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "Social_Media/posts" })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }


    const post = await Post.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $exists: false }, createdBy: req.user._id },
        { ...req.body, updatedBy: req.user._id },
        { new: true })
    return post ? successResponse({ res, status: 200, data: { post } }) : next(new Error("Post not found", { cause: 404 }))

});


export const freezePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id }
    const post = await Post.findOneAndUpdate(
        { _id: id, isDeleted: { $exists: false }, ...owner },
        { isDeleted: true, updatedBy: req.user._id, deletedBy: req.user._id },
        { new: true }
    )
    return post ? successResponse({ res, status: 200, data: { post } }) : next(new Error("Post not found", { cause: 404 }))
});


export const unFreezePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const post = await Post.findOneAndUpdate(
        { _id: id, isDeleted: { $exists: true }, deletedBy: req.user._id },
        { $unset: { isDeleted: 0, deletedBy: 0 }, updatedBy: req.user._id },
        { new: true }
    )
    return post ? successResponse({ res, status: 200, data: { post } }) : next(new Error("Post not found", { cause: 404 }))
});


export const likePost = asyncHandler(async (req, res, next) => {
    const data = req.query.action === "unlike" ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
    const { id } = req.params
    const post = await Post.findOneAndUpdate(
        { _id: id, isDeleted: { $exists: false } },
        data,
        { new: true }
    )
    return post ? successResponse({ res, status: 200, data: { post } }) : next(new Error("Post not found", { cause: 404 }))
});
