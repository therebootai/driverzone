"use server";

import Razorpay from "razorpay";
import crypto from "crypto";

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_SECRET_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export async function VERIFY_PAYMENT({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return {
        success: false,
        message: "Invalid payment signature",
      };
    }

    const payment = await razor.payments.fetch(razorpay_payment_id);

    return { success: true, message: "Payment verified successfully", payment };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
