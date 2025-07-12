import Post from "../../../Database/models/post.model.js"



export const getOnePost = async (_, args) => {
    const { id } = args
    const post = await Post.findById(id).populate('user')
    console.log(post);
    return post
}

export const getAllPosts = async (_, args) => {
    const posts = await Post.find().populate('user')    
    return posts
}