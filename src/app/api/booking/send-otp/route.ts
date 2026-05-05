import { NextRequest, NextResponse } from "next/server";
import { sendBookingArrivalOTP } from "@/actions/bookingAction";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 },
      );
    }

    const result = await sendBookingArrivalOTP(bookingId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      otp: result.otp,
      customerPhone: result.customerPhone,
    });
  } catch (error: any) {
    console.error("SEND BOOKING OTP API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 },
    );
  }
}
