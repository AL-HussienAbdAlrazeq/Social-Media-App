import { GraphQLID, GraphQLNonNull } from "graphql";

export const onePostRequest = { id: { type: new GraphQLNonNull(GraphQLID) } }