import mongoose from 'mongoose';

let isConnected=false; //  true if connected

export const connectToDB= async()=>{

  mongoose.set('strictQuery',true);

  if(!process.env.MONGODB_URL) return console.log('MONGODB_URL not connected');

  if(isConnected) return console.log('already connected to MongoDB');

  try{
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log('Connected to MongoDB');
  }
  catch(error){
    console.error('Failed to connect to MongoDB',error);
    

  }

}