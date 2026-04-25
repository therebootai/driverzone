"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Customers from "@/models/Customers";
import { handleImageUpload } from "@/utils/handleImageUpload";
import { verifyOTP } from "@/actions/OTPActions";
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
      if (key !== "otp") {
        updateData[key] = value;
      }
    }

    if (updateData.cars && typeof updateData.cars === "string") {
      try {
        const parsed = JSON.parse(updateData.cars);
        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            { message: "cars must be an array", success: false },
            { status: 400 },
          );
        }
        const validTypes = ["SUV", "Hatchback", "Sedan", "Mini", "Van", "Others"];
        for (const car of parsed) {
          if (!car.car_type || !validTypes.includes(car.car_type)) {
            return NextResponse.json(
              { message: `Invalid car_type: ${car.car_type}`, success: false },
              { status: 400 },
            );
          }
          if (!car.registration_number || typeof car.registration_number !== "string" || !car.registration_number.trim()) {
            return NextResponse.json(
              { message: "registration_number is required for all cars", success: false },
              { status: 400 },
            );
          }
        }
        updateData.cars = parsed;
      } catch {
        return NextResponse.json(
          { message: "Invalid cars format", success: false },
          { status: 400 },
        );
      }
    }

    if (updateData.mobile_number && updateData.mobile_number !== user.mobile_number) {
      const otp = formData.get("otp") as string;
      if (!otp) {
        return NextResponse.json(
          { message: "OTP is required for mobile update", success: false },
          { status: 400 },
        );
      }
      const { success, message } = await verifyOTP(
        null,
        updateData.mobile_number,
        otp,
        "update-profile",
      );
      if (!success) {
        return NextResponse.json({ message, success: false }, { status: 400 });
      }
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
