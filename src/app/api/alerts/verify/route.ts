import { NextRequest, NextResponse } from "next/server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const AlertModel = (await import("@/models/Alert")).default;
    const Booking = (await import("@/models/Booking")).default;

    // Check if any alert for this booking is still active
    const activeAlert = await AlertModel.findOne({
      booking_id: bookingId,
      status: "active",
    });

    // Also check the booking status directly
    const booking = await Booking.findById(bookingId);

    const isAvailable =
      activeAlert !== null &&
      booking !== null &&
      booking.status === "pending";

    return NextResponse.json({
      success: true,
      isAvailable,
      bookingStatus: booking?.status || "unknown",
      alertStatus: activeAlert?.status || "none",
    });
  } catch (error: any) {
    console.error("Error verifying alert:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify alert" },
      { status: 500 },
    );
  }
}
