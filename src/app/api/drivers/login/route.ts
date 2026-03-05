import { verifyOTP } from "@/actions/OTPActions";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Driver from "@/models/Drivers";
import { generateToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { otp, email, phone } = data;

    await connectToDatabase();
    await ensureModelsRegistered();

    const result = await verifyOTP(email, phone, otp, "login");

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    //@ts-ignore
    const driver = await Driver.findOne({ mobile_number: phone });

    if (!driver) {
      return NextResponse.json(
        { message: "Driver not found" },
        { status: 400 },
      );
    }

    if (!driver.status) {
      return NextResponse.json(
        { message: "Your account is blocked" },
        { status: 400 },
      );
    }

    const token = generateToken({ userId: driver._id });

    return NextResponse.json(
      { user: driver, token, success: true },
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
