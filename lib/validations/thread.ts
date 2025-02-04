// this form is used to store the user data....
import * as z from "zod";

export const ThreadValidation= z.object({
  thread: z.string().nonempty().min(3,{message:"Minimum 3 characters"}),
  accountId:z.string(),

})

export const CommentValidation= z.object({
  thread: z.string().nonempty().min(3,{message:"Minimum 3 characters"}),
  
})