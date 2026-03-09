import { PriorityAlertService } from "@/actions/alertActions";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import { verifyDriverToken } from "@/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();
    const { response } = body;
    let { alertId, driverId } = body;

    // Authenticate driver if token is present
    let driver;
    if (token) {
      const jwtToken = token.startsWith("Bearer ")
        ? token.split("Bearer ")[1]
        : token;
      driver = await verifyDriverToken(jwtToken);
    }

    // Resolve driverId from token if not in body
    if (!driverId && driver) {
      driverId = driver._id.toString();
    }

    // Resolve alertId from driver's activeAlerts if not in body
    if (!alertId && driver && driver.activeAlerts) {
      // Find the alert associated with the driver's active booking
      // Note: This is a fallback if alertId is completely missing
      const AlertModel = (await import("@/models/Alert")).default;
      const activeAlert = await AlertModel.findOne({
        booking_id: driver.activeAlerts.bookingId,
        status: "active",
      });
      if (activeAlert) {
        alertId = activeAlert.alert_id;
      }
    }

    if (!alertId || !driverId || !response) {
      return NextResponse.json(
        {
          success: false,
          error: "Alert ID, Driver ID, and response are required",
          details: {
            hasAlertId: !!alertId,
            hasDriverId: !!driverId,
            hasResponse: !!response,
          },
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
        : response === "rejected"
          ? "Driver rejected the ride"
          : "Action completed",
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
