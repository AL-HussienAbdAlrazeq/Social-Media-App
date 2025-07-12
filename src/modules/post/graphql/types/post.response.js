import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { imageType } from "../../../../utils/graphql/image.type.js";
import { OneUserResponse } from "../../../user/graphql/user.types.response.js";

export const onePostResponse = new GraphQLObjectType({
    name: 'OnePost',
    fields: {
        content: { type: GraphQLString },
        attachments: {
            type: new GraphQLList(imageType)
        },
        likes: { type: new GraphQLList(GraphQLID) },
        tags: { type: new GraphQLList(GraphQLID) },
        createdBy: { type: OneUserResponse },
        updatedBy: { type: GraphQLID },
        deletedBy: { type: GraphQLID },
        isDeleted: { type: GraphQLBoolean },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString }
    }
})


export const AllPostResponse = new GraphQLList(onePostResponse)