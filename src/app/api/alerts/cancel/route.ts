import { alertService } from "@/services/alertService";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import { verifyDriverToken } from "@/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();
    let { alertId } = body;

    // Authenticate driver if token is present
    let driver;
    if (token) {
      const jwtToken = token.startsWith("Bearer ")
        ? token.split("Bearer ")[1]
        : token;
      driver = await verifyDriverToken(jwtToken);
    }

    // Resolve alertId from driver's activeAlerts if not in body
    if (!alertId && driver && driver.activeAlerts) {
      // Find the alert associated with the driver's active booking
      const AlertModel = (await import("@/models/Alert")).default;
      const activeAlert = await AlertModel.findOne({
        booking_id: driver.activeAlerts.bookingId,
        status: "active",
      });
      if (activeAlert) {
        alertId = activeAlert.alert_id;
      }
    }

    if (!alertId) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const cancelled = await alertService.cancelAlert(alertId);

    return NextResponse.json({
      success: cancelled,
      message: cancelled
        ? "Alert cancelled successfully"
        : "Failed to cancel alert",
    });
  } catch (error: any) {
    console.error("Error cancelling alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel alert" },
      { status: 500 },
    );
  }
}
