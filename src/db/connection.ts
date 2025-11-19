"use server";
import mongoose from "mongoose";

let isConnected = false;

const connectToDataBase = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) return;


  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing Mongo URI. Set MONGO_URI (or MONGODB_URI) in .env.local / host env."
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
  } catch (error: any) {
    console.error("Error connecting to the database:", error);
    throw new Error(`Mongo connect failed: ${error?.message || String(error)}`);
  }
};

export default connectToDataBase;
