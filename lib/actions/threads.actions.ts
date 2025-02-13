"use server"

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({text, author, communityId, path}: Params) {
  try {
    await connectToDB();
  
    const createThread = await Thread.create({
      text,
      author,
      communityId: null,
    });
  
    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread._id }
    });

    revalidatePath(path);
  } catch(error: any) {
    console.error("Error creating thread:", error);
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();

    // Calculate skip amount
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a lean query for better performance
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(pageSize)
      .select('text createdAt author children')
      .lean()
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image'
      });

    // Execute count query with timeout
    const countQuery = Thread.countDocuments({ 
      parentId: { $in: [null, undefined] } 
    }).maxTimeMS(10000);

    // Execute both queries in parallel
    const [posts, totalPostsCount] = await Promise.all([
      postsQuery.exec(),
      countQuery
    ]);

    // Process the results
    const postsWithChildren = posts.map(post => ({
      ...post,
      children: post.children || []
    }));

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts: postsWithChildren, isNext };
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function fetchThread(id: string) {
  try {
    await connectToDB();

    const threadQuery = Thread.findById(id)
      .select('text createdAt author children')
      .lean()
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image'
      })
      .populate({
        path: 'children',
        model: Thread,
        select: 'text createdAt author',
        perDocumentLimit: 10,
        populate: {
          path: 'author',
          model: User,
          select: '_id id name image'
        }
      })
      .maxTimeMS(10000);

    const thread = await threadQuery.exec();

    if (!thread) throw new Error("Thread not found");

    // Type assertion to handle the populated thread type
    const threadWithChildren = {
      ...thread,
      children: Array.isArray((thread as any).children) ? (thread as any).children : []
    };

    return threadWithChildren;
  } catch(error: any) {
    console.error("Error fetching thread:", error);
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    await connectToDB();

    // Create the comment thread first
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    });

    // Save the comment
    const savedComment = await commentThread.save();

    // Update the original thread with the new comment
    await Thread.findByIdAndUpdate(
      threadId,
      { 
        $push: { children: savedComment._id } 
      },
      { 
        new: true,
        maxTimeMS: 10000 // Add timeout
      }
    );

    revalidatePath(path);
  } catch (err: any) {
    console.error("Error adding comment:", err);
    throw new Error(`Unable to add comment: ${err.message}`);
  }
}



