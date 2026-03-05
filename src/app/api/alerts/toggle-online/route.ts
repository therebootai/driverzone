import Driver from "@/models/Drivers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { driverId, isOnline } = await request.json();

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: "Driver ID is required" },
        { status: 400 },
      );
    }

    // @ts-ignore
    const driver = await Driver.findOne({ driver_id: driverId });
    if (!driver) {
      return NextResponse.json(
        { success: false, error: "Driver not found" },
        { status: 404 },
      );
    }

    driver.isOnline = isOnline;
    driver.currentLocation.lastUpdated = new Date();
    await driver.save();

    return NextResponse.json({
      success: true,
      message: isOnline ? "Driver is now online" : "Driver is now offline",
      driver: {
        driver_id: driver.driver_id,
        driver_name: driver.driver_name,
        isOnline: driver.isOnline,
      },
    });
  } catch (error: any) {
    console.error("Error toggling online status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update status" },
      { status: 500 },
    );
  }
}
