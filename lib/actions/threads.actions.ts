"use server"

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import path from "path";
import mongoose from "mongoose";


interface Params{
  text:string,
  author:string,
  communityId: string | null,
  path : string,
}

export async function createThread({text,author,communityId,path}: Params) {

  try{
    connectToDB();
  
  const createThread = await Thread.create({
    text,
    author,
    communityId:null,
  });
  
//update user model
 await User.findByIdAndUpdate(author,{
  $push:{threads:createThread._id}
 })

  revalidatePath(path);
  }
  catch(error:any){
    throw new Error(`failed to create thread ${error.message}`);
  }


}


export async function fetchPosts(pageNumber=1,pageSize=20){
  connectToDB();

  // amount of posts to skip
  const skipAmount = (pageNumber-1)*pageSize;

  //fetch the possts that don't have parents(top-level posts)
  const postsQuery = Thread.find({parentId:{$in:[null,undefined]}})
  .sort({createdAt:'desc'})
  .skip(skipAmount)
  .limit(pageSize)
  .populate({path:'author',model:'User'})  //creator
  .populate({
    path:'children',  //populate the children of the posts / comments
    populate:{
        path:'author',
        model:'User',
        select:'_id name parentId image',
    }
  })

  const totalPostsCount =  await Thread.countDocuments({parentId:{$in:[null,undefined]}});

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return {posts,isNext};
}


export async function fetchThread(id:string){
   connectToDB();

   try{

    //TODO populate the community
    const thread = await Thread.findById(id)    
    .populate({
      path:'author',
      model:User,
      select:'_id id name image'
    })
    .populate({
      path:'children',
      populate:[
        {
          path:'author',
          model:User,
          select:'_id id name parentId image'
        },
        {
          path:'children',
          model:Thread,
          populate:{
            path:'author',
            model:User,
            select:'_id id name parentId image'
          }
        }
      ]
    }).exec();

    return thread;

   }
   catch(error:any){
     throw new Error(`failed to fetch thread ${error.message}`);
   }


}


// export async function addCommentToThread(
//   threadId:string,
//   commentText:string,
//   userId:string,
//   path:string,
// ) {
//   connectToDB();

//   try{
//     //find the original thread by its id
//     const originalThread = await Thread.findById(threadId);

//     if(!originalThread){
//       throw new Error('thread not found');
//     }

//      // Validate userId before converting it to ObjectId
//     //  if (!mongoose.Types.ObjectId.isValid(userId)) {
//     //   throw new Error("Invalid userId format: Must be a 24-character hex string.");
//     // }

//      // Convert userId to ObjectId
//     //  const authorObjectId = new mongoose.Types.ObjectId(userId);

//     //create a new Thread  with comment text
//     const commentThread = new   Thread({
//       text:commentText,
//       author:userId,
//       parentId: threadId,
//     })

//     //save the comment thread
//     const savedCommentThread = await commentThread.save();

//     //update the original thread to include new comment...
//     originalThread.children.push(savedCommentThread._id);

//     //save the original thread
//     await originalThread.save();

//     //to see the latest data...refreshing.(ISR)
//     revalidatePath(path);

//   }
//   catch(error:any){
//     throw new Error(`failed to add comment to thread ${error.message}`);
//   }
  
// }


//by gpt
export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  await connectToDB();

  try {
    console.log("🔹 Received Data:", { threadId, commentText, userId, path });

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      throw new Error("Invalid threadId format.");
    }

    // Sanitize and validate userId
    const sanitizedUserId = userId.replace(/"/g, '');
    if (!mongoose.Types.ObjectId.isValid(sanitizedUserId)) {
      throw new Error("Invalid userId format: Must be a 24-character hex string.");
    }

    const authorObjectId = new mongoose.Types.ObjectId(sanitizedUserId);
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread not found.");
    }

    console.log("✅ Thread found:", originalThread);

    const commentThread = new Thread({
      text: commentText,
      author: authorObjectId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();
    console.log("✅ Comment saved:", savedCommentThread);

    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();
    console.log("✅ Original thread updated with new comment.");

    revalidatePath(path);
  } catch (err: any) {
    console.error("❌ Error while adding comment:", err.message);
    throw new Error(`Unable to add comment: ${err.message}`);
  }
}



