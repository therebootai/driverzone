"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Customers from "@/models/Customers";
import { handleImageUpload } from "@/utils/handleImageUpload";
import { verifyCustomerToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }
    await connectToDatabase();
    await ensureModelsRegistered();
    const user = await verifyCustomerToken(token.split("Bearer ")[1]);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return NextResponse.json({ user, success: true }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const user = await verifyCustomerToken(token.split("Bearer ")[1]);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const updateData: any = {};

    const profilePicture = formData.get("profile_picture") as File | null;
    const coverPicture = formData.get("cover_picture") as File | null;

    if (profilePicture) {
      updateData.profile_picture = await handleImageUpload(
        profilePicture,
        user.profile_picture?.public_id,
      );
    }

    if (coverPicture) {
      updateData.cover_picture = await handleImageUpload(
        coverPicture,
        user.cover_picture?.public_id,
      );
    }

    for (const [key, value] of formData.entries()) {
      // Skip already processed image fields
      if (key === "profile_picture" || key === "cover_picture") continue;

      // Handle other fields
      updateData[key] = value;
    }

    const updatedUser = await Customers.findOneAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true },
    );
    return NextResponse.json(
      { user: updatedUser, success: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}
