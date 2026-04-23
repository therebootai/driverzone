"use server";

import { resendOTP } from "@/actions/OTPActions";
import { SEND_BY_WHATSAPP } from "@/actions/waActions";
import { ensureModelsRegistered } from "@/db/connection";
import Driver from "@/models/Drivers";
import Customer from "@/models/Customers";
import User from "@/models/Users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await ensureModelsRegistered();

    if (data.type === "login") {
      const phone = data.phone;
      const [driver, customer, user] = await Promise.all([
        //@ts-ignore
        Driver.findOne({ mobile_number: phone }),
        User.findOne({ mobile_number: phone }),
      ]);

      const existingUser = driver || customer || user;

      if (!existingUser) {
        return NextResponse.json(
          { message: "number is not registered in database", success: false },
          { status: 200 },
        );
      }

      if (existingUser.status === false) {
        return NextResponse.json(
          { message: "Login is not allowed", success: false },
          { status: 200 },
        );
      }
    }

    const otp = await resendOTP(data.email, data.phone, data.type);
    console.log(otp);
    await SEND_BY_WHATSAPP({ mobile: data.phone, message: otp.data ?? "" });
    return NextResponse.json(
      { message: "OTP sent successfully", success: true },
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
