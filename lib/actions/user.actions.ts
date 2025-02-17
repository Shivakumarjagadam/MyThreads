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

    const user = await User.findOne({ id: userId })
      .select('_id id username name image bio onboarded')
      .lean()
      .maxTimeMS(10000);

    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}


export async function fetchUserPosts(userId: string) {
  try {
    await connectToDB();

    // Find user and include their basic info along with threads
    const user = await User.findOne({ id: userId })
      .select('name username image threads')
      .lean()
      .maxTimeMS(5000);

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch threads separately with limited fields
    const threads = await Thread.find({ _id: { $in: user.threads } })
      .select('text createdAt author children')
      .limit(10) // Limit to recent 10 threads
      .populate({
        path: 'author',
        model: User,
        select: 'name image id'
      })
      .populate({
        path: 'children',
        model: Thread,
        select: 'author',
        perDocumentLimit: 3,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id'
        }
      })
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(5000);

    return {
      ...user,
      threads: threads || []
    };
  } catch (error: any) {
    console.error("Error fetching user posts:", error);
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}


export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc"
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } }
      ];
    }

    const usersQuery = User.find(query)
      .sort({ createdAt: sortBy })
      .skip(skipAmount)
      .limit(pageSize)
      .lean()
      .select('_id id name username image')
      .maxTimeMS(10000);

    const totalUsersCount = await User.countDocuments(query)
      .maxTimeMS(5000);

    const users = await usersQuery.exec();
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}


export async function getActivity(userId: string) {
  try {
    connectToDB();

    // Find all threads created by user with timeout
    const userThreads = await Thread.find({ author: userId })
      .select('children')
      .lean()
      .maxTimeMS(10000);

    // Collect all the children thread IDs
    const childThreadsIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children || []);
    }, []);

    // Find all replies with proper population and timeout
    const replies = await Thread.find({
      _id: { $in: childThreadsIds },
      author: { $ne: userId }
    })
    .select('text author parentId createdAt')
    .populate({
      path: 'author',
      model: User,
      select: 'name image _id'
    })
    .lean()
    .maxTimeMS(10000);

    return replies;
  } catch (error: any) {
    console.error("Error fetching activity:", error);
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
