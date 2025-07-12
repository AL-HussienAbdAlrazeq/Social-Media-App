import { getAllPosts, getOnePost } from "./post.graphql.service.js";
import { AllPostResponse, onePostResponse } from "./types/post.response.js";
import { onePostRequest } from "./types/post.request.js";
import { GraphQLID, GraphQLNonNull } from "graphql";
import Post from "../../../Database/models/post.model.js";

export const PostQuery = {
    onePost: {
        type: onePostResponse,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (parent, args) => {
            const { id } = args;
            const post = await Post.findById(id);
            return post;
        }
    },
    allPosts: {
        type: AllPostResponse,
        resolve: () => getAllPosts()
    }
}

