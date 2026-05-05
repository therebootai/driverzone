import { NextResponse } from "next/server";
import { connectToDatabase, ensureModelsRegistered } from "@/db/connection";
import Booking from "@/models/Booking";
import { isValidObjectId } from "mongoose";
import { updateBooking } from "@/actions/bookingAction";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/booking/[id]">,
) {
  try {
    const { id } = await params;

    await connectToDatabase();
    await ensureModelsRegistered();

    const booking = await Booking.findOne({
      $or: [{ _id: isValidObjectId(id) ? id : null }, { booking_id: id }],
    })
      .populate("customerDetails", "name mobile_number")
      .populate(
        "driverDetails",
        "driver_name mobile_number profile_picture vehicle_number rating",
      )
      .populate("package_type", "name total_price duration")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("GET BOOKING STATUS API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/booking/[id]">,
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 },
      );
    }

    const result = await updateBooking(id, body, {
      validateOtp: !!body.otp,
      updateCustomerRating: !!body.updateCustomerRating,
      updateDriverRating: !!body.updateDriverRating,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
          errors: result.validationErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    console.error("PUT BOOKING API ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update booking" },
      { status: 500 },
    );
  }
}
