"use server";
import mongoose from "mongoose";

let isConnected = false;

const connectToDataBase = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("DB connected already");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    isConnected = true;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw new Error("Database connection failed");
  }
};

export default connectToDataBase;
