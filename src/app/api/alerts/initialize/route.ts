import { alertService } from "@/services/alertService";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const alert = await alertService.initializeAlert(bookingId);

    return NextResponse.json({
      success: true,
      alertId: alert.alert_id,
      status: alert.status,
      message: "Alert initialized successfully",
    });
  } catch (error: any) {
    console.error("Error initializing alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize alert" },
      { status: 500 },
    );
  }
}
