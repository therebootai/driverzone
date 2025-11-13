"use server";

import connectToDataBase from "@/db";
import Users from "@/models/Users";
import { generateCustomId } from "@/utils/generateCustomId";
import mongoose from "mongoose";

export async function CREATEUSER(data: any) {
  try {
    await connectToDataBase();

    const existingMobileNumer = await Users.findOne({
      mobile_number: data.mobile_number,
    });
    if (existingMobileNumer) {
      return { success: false, error: "This mobile number already exists" };
    }
    const existingEmail = await Users.findOne({
      email: data.email,
    });
    if (existingEmail) {
      return { success: false, error: "This Email already exists" };
    }
    if (!data.user_id) {
      data.user_id = await generateCustomId(Users, "user_id", "userId");
    }

    const newUser = new Users(data);

    const savedUser = await newUser.save();

    // revalidatePath("/user-managment");
    return { success: true, user: JSON.parse(JSON.stringify(savedUser)) };
  } catch (error: any) {
    console.error("Error creating User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function GETALLUSERS({
  page = 1,
  limit = 20,
  name,
  mobile_number,
  role,
  status,
}: {
  page: number;
  limit: number;
  name?: string;
  mobile_number?: string;
  role?: "admin" | "staff";
  status?: boolean;
}) {
  try {
    await connectToDataBase();

    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (mobile_number) {
      query.mobile_number = { $regex: mobile_number, $options: "i" };
    }
    if (role) {
      query.role = role;
    }
    if (typeof status === "boolean") {
      query.status = status;
    }

    const users = await Users.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await Users.countDocuments(query);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(users)),
      paginations: {
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      },
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      error: error.message || "Unknown error",
      data: [],
      paginations: { totalPages: 0, currentPage: 1 },
    };
  }
}

export async function UPDATEUSER(userId: string, data: any) {
  try {
    await connectToDataBase();

    const existingUser = await Users.findOne({
      $or: [
        { user_id: userId },
        {
          _id: mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : undefined,
        },
      ],
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    if (
      data.mobile_number &&
      data.mobile_number !== existingUser.mobile_number
    ) {
      const mobileExists = await Users.findOne({
        mobile_number: data.mobile_number,
        _id: { $ne: existingUser._id },
      });
      if (mobileExists) {
        return { success: false, error: "This mobile number already exists" };
      }
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await Users.findOne({
        email: data.email,
        _id: { $ne: existingUser._id },
      });
      if (emailExists) {
        return { success: false, error: "This Email already exists" };
      }
    }

    Object.keys(data).forEach((key) => {
      (existingUser as any)[key] = data[key];
    });

    const updatedUser = await existingUser.save();

    return { success: true, user: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    console.error("Error updating User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function DELETEUSER(userId: string) {
  try {
    await connectToDataBase();

    const deletedUser = await Users.findOneAndDelete({
      $or: [
        { user_id: userId },
        {
          _id: mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : undefined,
        },
      ],
    });

    if (!deletedUser) {
      return { success: false, error: "User not found" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
