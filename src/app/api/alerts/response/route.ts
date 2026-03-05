import { PriorityAlertService } from "@/actions/alertActions";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";

export async function POST(request: NextRequest) {
  try {
    const { alertId, driverId, response } = await request.json();

    if (!alertId || !driverId || !response) {
      return NextResponse.json(
        {
          success: false,
          error: "Alert ID, Driver ID, and response are required",
        },
        { status: 400 },
      );
    }

    if (!["accepted", "rejected"].includes(response)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Response must be either "accepted" or "rejected"',
        },
        { status: 400 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const alertService = PriorityAlertService.getInstance();
    const accepted = await alertService.handleDriverResponse(
      alertId,
      driverId,
      response,
    );

    return NextResponse.json({
      success: true,
      accepted,
      message: accepted
        ? "Driver accepted the ride"
        : "Driver rejected the ride",
    });
  } catch (error: any) {
    console.error("Error handling driver response:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process driver response",
      },
      { status: 500 },
    );
  }
}
