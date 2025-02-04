"use server"

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { connected } from "process";
import page from "@/app/(root)/thread/[id]/page";
import { FilterQuery, SortOrder } from "mongoose";

interface Params{
  userId:string,
  username:string,
  name:string,
  bio:string,
  image:string,
  path:string,
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,

}:Params): Promise<void>{
  connectToDB(); 
  
  try{

    await User.findOneAndUpdate(
      {id:userId},
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded:true,
  
      },
      {upsert:true}  //upsert is used to update and insert
  
       )
  
       if(path==='/profile/edit'){
        revalidatePath(path);
      }

  }
  catch(error:any){
    throw new Error(`failed to create/update profile ${error.message}`);
  }

}


// export async function fetchUser(userId:string){

//   try{
//     connectToDB();

//     return await User.findOne({id:userId})
//     // .populate({
//     //   path:'communities',
//     //   model:Community
//     // })

//   }
//   catch(error:any){
//     throw new Error(`failed to fetch user ${error.message}`);
//   }
// }


export async function fetchUser(userId: string) {
  try {
    connectToDB();

    const user = await User.findOne({ id: userId });

    if (!user) return null;

    // Convert Mongoose document to a plain object
    const plainUser = JSON.parse(JSON.stringify(user));

    return plainUser; // Now it's serializable
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}


export async function fetchUserPosts(userId:string){
 

  try{
    connectToDB();
    //finding user posts based on userid...

    // TODO populate community...

    const threads = await User.findOne({id:userId })
    .populate({
      path:'threads',
      model:Thread,
      populate:{
        path:'children', //also include comments and anythings from user...
        model:Thread,
        populate:{
         path:'author',
         model:User,
         select:'name image id' 
        }
      }
    })

    return threads;
  }
  catch(error:any){
    throw new Error(`failed to fetch user posts ${error.message}`);
  }

}
 


export async function fetchUsers({
  userId,      //current user id where to not show this..
  searchString="",
  pageNumber=1,
  pageSize=20,
  sortBy="desc",
}:{
  userId:string,
  searchString?:string,
  pageNumber?:number,
  pageSize?:number,
  sortBy?:SortOrder,
}){

  try{

    connectToDB();
    const skipAmount = (pageNumber-1)* pageSize;

    const regex = new RegExp(searchString,"i");

    const query: FilterQuery<typeof User> = {
      id:{$ne :userId},

    }
    if(searchString.trim()!==""){
      query.$or=[
        {username:{$regex:regex}},
        {name:{$regex:regex}},
      ]
    }

    const sortOptions = {createdAt:sortBy};

    const usersQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize);

    const totalUsersCount =await User.countDocuments(query);

    const users =await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return {users,isNext};

  }
  catch(error: any){
    throw new Error(`failed to fetch users ${error.message}`);
  }
}


export async function getActivity(userId:string) {

  try{
    connectToDB();
    //find all threads created by user.
    const userThreads = await Thread.find({author: userId});

    // collect all the chidlren thread replies(id's) of user threads
    //colleccting all comments in a storing in an array...
    const childThreadsIds = await  userThreads.reduce((acc, userThread)=>{
        return acc.concat(userThread.children)
    },[]);   //pass default  array(empty array)


    // finding all comments(replies) of the child threads
    const replies = await Thread.find({
      _id:{$in: childThreadsIds},
      author:{$ne: userId}
    })
    .populate({
      path:'author',
      model:User,
      select:'name image _id'
    })

    return replies;
    
  }
  catch(error:any){
    throw new error(`failed to fetch the activity..${error.message}`);
  }
  
}
