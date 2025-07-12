import { GraphQLObjectType, GraphQLString } from "graphql";
import { imageType } from "../../../utils/graphql/image.type.js";

export const OneUserResponse = new GraphQLObjectType({
    name: 'OneUser',
    fields: {
        username: {
            type: GraphQLString,
        },
        email: { type: GraphQLString },
        image: { type: imageType },

    }
})