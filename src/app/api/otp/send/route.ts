"use server";

import { createOTP } from "@/actions/OTPActions";
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
      const [driver, user, customer] = await Promise.all([
        Driver.findOne({ mobile_number: phone }),
        User.findOne({ mobile_number: phone }),
        Customer.findOne({ mobile_number: phone }),
      ]);

      const existingUser = driver || user || customer;

      if (existingUser && existingUser.status === false) {
        return NextResponse.json(
          { message: "Login is not allowed", success: false },
          { status: 401 },
        );
      }
    }

    const otp = await createOTP(data.email, data.phone, data.type);
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
