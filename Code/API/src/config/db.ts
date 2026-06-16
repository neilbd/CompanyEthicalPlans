import mongoose from 'mongoose';

// Connect to MongoDB. Called once during server startup before app.listen.
export const connectMongo = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI as string;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
};
