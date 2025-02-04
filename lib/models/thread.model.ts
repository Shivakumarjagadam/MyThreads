import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: {type: 'string',required: true},
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
  },
  community:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Community',
  },
  createdAt:{
    type:'date',
    default : Date.now,
  },
  parentId:{
    type:String,
  },
  children:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Thread',
    }
  ]
 
  // here parent and childrens are used as recusrion,
  // parent is the main thread and children are the replies to the main thread ,eg: comments for a post
});

const Thread = mongoose.models.Thread || mongoose.model('Thread',threadSchema);

export default Thread;