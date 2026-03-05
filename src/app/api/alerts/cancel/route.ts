import { PriorityAlertService } from "@/actions/alertActions";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";

export async function POST(request: NextRequest) {
  try {
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const alertService = PriorityAlertService.getInstance();
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
