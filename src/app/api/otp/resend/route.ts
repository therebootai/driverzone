"use server";

import { resendOTP } from "@/actions/OTPActions";
import { SEND_BY_WHATSAPP } from "@/actions/waActions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const otp = await resendOTP(data.email, data.phone, data.type);
    console.log(otp);
    await SEND_BY_WHATSAPP({ mobile: data.phone, message: otp.data ?? "" });
    return NextResponse.json(
      { message: "OTP sent successfully", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 }
    );
  }
}
