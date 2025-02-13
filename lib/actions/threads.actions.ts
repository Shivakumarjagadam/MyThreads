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

    // Amount of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Execute queries in parallel
    const [posts, totalPostsCount] = await Promise.all([
      Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
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
          select: 'author text createdAt',
          perDocumentLimit: 3,
          populate: {
            path: 'author',
            model: User,
            select: '_id id name image'
          }
        }),
      Thread.countDocuments({ parentId: { $in: [null, undefined] } })
    ]);

    // Ensure each post has a children array
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

    const thread = await Thread.findById(id)
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
      }) as any; // Temporary type assertion to resolve the issue

    if (!thread) throw new Error("Thread not found");

    const threadWithChildren = {
      ...thread,
      children: Array.isArray(thread.children) ? thread.children : []
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

    // Find the original thread first
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the comment thread
    const commentThread = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId
    });

    // Add comment to original thread's children
    originalThread.children.push(commentThread._id);
    await originalThread.save();

    // Revalidate the path
    revalidatePath(path);
  } catch (err: any) {
    console.error("Error adding comment:", err);
    throw new Error(`Unable to add comment: ${err.message}`);
  }
}



