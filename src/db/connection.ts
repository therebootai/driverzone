"use server";
import mongoose from "mongoose";
import dns from "dns";


const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

// Interface for cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  modelsRegistered: boolean;
}

// Use global to persist across serverless function invocations
declare global {
  var mongooseGlobal: MongooseCache | undefined;
}

// Initialize or use cached connection
const cached: MongooseCache = global.mongooseGlobal || {
  conn: null,
  promise: null,
  modelsRegistered: false,
};

if (!global.mongooseGlobal) {
  global.mongooseGlobal = cached;
}

export async function connectToDatabase() {
  // If already connected, return cached connection
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    cached.promise = mongoose
    .connect(MONGODB_URI as string, opts)
    .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        cached.promise = null;
        throw error;
      });
    }
    
    try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  
  return cached.conn;
}

// Function to ensure models are registered
export async function ensureModelsRegistered() {
  await connectToDatabase();
  
  if (!cached.modelsRegistered) {
    // Dynamically import and register models
    await import("@/models/Packages");
    await import("@/models/Booking");
    await import("@/models/Customers");
    await import("@/models/Drivers");
    await import("@/models/OTP");
    await import("@/models/Users");
    await import("@/models/Zones");
    await import("@/models/Coupon");

    cached.modelsRegistered = true;
    console.log("✅ All models registered");
  }
}

export default connectToDatabase;
