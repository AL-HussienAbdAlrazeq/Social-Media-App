import { GraphQLObjectType, GraphQLString } from "graphql";

 export const imageType = new GraphQLObjectType({
                 name: 'attachment',
                 fields: {
                     secure_url: { type: GraphQLString },
                     public_id: { type: GraphQLString }
                 }
             })