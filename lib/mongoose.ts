import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) {
    throw new Error('MONGODB_URL not found');
  }

  if (isConnected) {
    return;
  }

  try {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000
    };

    await mongoose.connect(process.env.MONGODB_URL, opts);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}