
import { model, Schema, Types } from "mongoose";



const commentModel = new Schema(
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
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment"},
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Date }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
  }
);

commentModel.virtual('reply',{
  localField:"_id",
  foreignField:"commentId",
  ref:"Comment"
})

const Comment = model("Comment", commentModel);
export default Comment;
