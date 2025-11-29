import { NextResponse } from "next/server";
import { createBooking } from "@/actions/bookingAction";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = [
      "pickupAddress",
      "pickupLat",
      "pickupLng",
      "dropAddress",
      "dropLat",
      "dropLng",
      "customerDetails",
      "vehicleType",
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const newBooking = await createBooking(body);

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE BOOKING API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
 