"use server";

import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_SECRET_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR" } = await req.json();
    const order = await razor.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_${Date.now()}`,
      payment_capture: true,
    });
    return NextResponse.json(
      {
        success: true,
        order,
      },
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
