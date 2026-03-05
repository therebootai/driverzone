"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Drivers from "@/models/Drivers";
import { handleImageUpload } from "@/utils/handleImageUpload";
import { verifyDriverToken } from "@/utils/jwt";
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
    const user = await verifyDriverToken(token.split("Bearer ")[1]);
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

    const user = await verifyDriverToken(token.split("Bearer ")[1]);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const updateData: any = {};

    const avatar = formData.get("avatar") as File | null;
    const psNoc = formData.get("ps_noc") as File | null;
    const identity_id_proof_url = formData.get(
      "identity_id_proof_url",
    ) as File | null;
    const licence_file_url = formData.get("licence_file_url") as File | null;

    if (avatar) {
      updateData.avatar = await handleImageUpload(
        avatar,
        user.avatar?.public_id,
      );
    }

    if (psNoc) {
      updateData.ps_noc = await handleImageUpload(
        psNoc,
        user.ps_noc?.public_id,
      );
    }

    if (identity_id_proof_url) {
      updateData.identity_id_proof_url = await handleImageUpload(
        identity_id_proof_url,
        user.identity_id_proof_url?.public_id,
      );
    }

    if (licence_file_url) {
      updateData.licence_file_url = await handleImageUpload(
        licence_file_url,
        user.licence_file_url?.public_id,
      );
    }
    

    for (const [key, value] of formData.entries()) {
      // Skip already processed image fields
      if (
        key === "avatar" ||
        key === "ps_noc" ||
        key === "identity_id_proof_url" ||
        key === "licence_file_url"
      )
        continue;

      // Handle other fields
      updateData[key] = value;
    }

    const updatedUser = await Drivers.findOneAndUpdate(
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

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "10mb",
//     },
//   },
// };