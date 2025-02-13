import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();

// Optimize user fetching by caching the promise
const getUser = async () => {
  try {
    return await currentUser();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new UploadThingError("Authentication failed");
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  media: f({ 
    image: { 
      maxFileSize: "2MB",  // Reduced for faster uploads
      maxFileCount: 1
    } 
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      try {
        const user = await getUser();
        if (!user) throw new UploadThingError("Unauthorized");
        return { userId: user.id };
      } catch (error) {
        console.error("Middleware error:", error);
        throw new UploadThingError("Upload authorization failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File URL:", file.url);
        return { uploadedBy: metadata.userId };
      } catch (error) {
        console.error("Upload completion error:", error);
        throw new Error("Failed to process upload");
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;