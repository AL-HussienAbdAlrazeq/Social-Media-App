
import { model, Schema, Types } from "mongoose";


const postModel = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 3000,
      trim: true,
      required: function () {
        return this.attachments?.length ? false : true
      }
    },
    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: Boolean
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

postModel.virtual('comments', {
  localField: "_id",
  foreignField: 'postId',
  ref: "Comment",
  justOne: true
})

const Post = model("Post", postModel);
export default Post;
