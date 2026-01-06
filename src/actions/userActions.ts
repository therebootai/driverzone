"use server";

import connectToDataBase, { ensureModelsRegistered } from "@/db/connection";
import Users from "@/models/Users";
import { generateCustomId } from "@/utils/generateCustomId";
import { generateToken, verifyToken } from "@/utils/jwt";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

await ensureModelsRegistered();

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

    revalidatePath("/admin/masters/user-managment");
    return { success: true, user: JSON.parse(JSON.stringify(savedUser)) };
  } catch (error: any) {
    console.error("Error creating User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function GETALLUSERS({
  page = 1,
  limit = 20,
  search,
  role,
  status,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "staff";
  status?: boolean;
}) {
  try {
    await connectToDataBase();

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile_number: { $regex: search, $options: "i" } },
      ];
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

    revalidatePath("/admin/masters/user-managment");
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

    revalidatePath("/admin/masters/user-managment");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function LOGIN({
  emailOrPhone,
  password,
}: {
  emailOrPhone: string;
  password: string;
}) {
  try {
    if (!emailOrPhone || !password) {
      return {
        success: false,
        message: "Email or Mobile number and password are required",
      };
    }

    await connectToDataBase();

    const user = await Users.findOne({
      $or: [{ email: emailOrPhone }, { mobile_number: emailOrPhone }],
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return { success: false, message: "Invalid password" };
    }

    if (!user.status) {
      return {
        success: false,
        message: "Account is disabled. Contact with Admin",
      };
    }

    const token = generateToken({ userId: user._id });
    if (!token) {
      return { success: false, message: "Failed to generate token" };
    }

    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
    });

    const loggedUser = await Users.findById(user._id)
      .select("-password")
      .lean();

    return {
      success: true,
      message: "Login successful",
      data: JSON.parse(JSON.stringify(loggedUser)),
    };
  } catch (error: any) {
    console.error("Error logging in:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
}

export async function VERIFY_AUTHORIZATION() {
  try {
    await connectToDataBase();
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await verifyToken(token.value);

    if (!user) {
      return { success: false, message: "Unauthorized", data: null };
    }

    return {
      success: true,
      message: "Authorized",
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: any) {
    console.error("Error logging in:", error);
    return {
      success: false,
      message: error.message || "Unknown error",
      data: null,
    };
  }
}

export async function LOGOUT() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return { success: true, message: "Logout successful" };
  } catch (error: any) {
    console.error("Error logging out:", error);
    return { success: false, message: "Internal server error" };
  }
}
