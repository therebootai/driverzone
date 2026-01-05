"use server";
import { verifyOTP } from "@/actions/OTPActions";
import connectToDataBase, { ensureModelsRegistered } from "@/db/connection";
import Customers from "@/models/Customers";
import { generateCustomId } from "@/utils/generateCustomId";
import { generateToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { otp, email, phone } = data;

    await connectToDataBase();
    await ensureModelsRegistered();

    const result = await verifyOTP(email, phone, otp, "login");

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
    let customer = await Customers.findOne({
      $or: [{ email }, { mobile_number: phone }],
    });

    if (customer && !customer.status) {
      return NextResponse.json(
        { message: "Your account is blocked" },
        { status: 400 }
      );
    }

    if (!customer) {
      const customer_id = await generateCustomId(
        Customers,
        "customer_id",
        "customerId"
      );
      const createdCustomer = await Customers.create({
        customer_id,
        mobile_number: phone,
        name: "New User",
      });

      if (!createdCustomer) {
        return NextResponse.json(
          { message: "Failed to create customer", success: false },
          { status: 400 }
        );
      }
      customer = createdCustomer;
    }

    const token = generateToken({ userId: customer._id });

    delete customer.password;
    return NextResponse.json(
      { user: customer, token, success: true },
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
