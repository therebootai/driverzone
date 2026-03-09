import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Booking from "@/models/Booking";
import { verifyDriverToken } from "@/utils/jwt";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const driver: any = await verifyDriverToken(token.split("Bearer ")[1]);
    if (!driver) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "today"; // today, weekly, monthly, 3month, 6month
    const dateParam = searchParams.get("date");

    let baseDate = new Date();
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        baseDate = new Date(year, month - 1, day);
      }
    }

    let startDate = new Date(baseDate);
    let endDate = new Date(baseDate);
    let prevStartDate = new Date(baseDate);
    let prevEndDate = new Date(baseDate);
    let groupBy = "hour";

    if (filter === "today") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      prevEndDate.setHours(23, 59, 59, 999);
      groupBy = "hour";
    } else if (filter === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setDate(prevStartDate.getDate() - 14);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setDate(prevEndDate.getDate() - 7);
      prevEndDate.setHours(23, 59, 59, 999);
      groupBy = "day";
    } else if (filter === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setMonth(prevStartDate.getMonth() - 2);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setMonth(prevEndDate.getMonth() - 1);
      prevEndDate.setHours(23, 59, 59, 999);
      groupBy = "day";
    } else if (filter === "3month") {
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setMonth(prevStartDate.getMonth() - 6);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setMonth(prevEndDate.getMonth() - 3);
      prevEndDate.setHours(23, 59, 59, 999);
      groupBy = "month";
    } else if (filter === "6month") {
      startDate.setMonth(startDate.getMonth() - 6);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setMonth(prevStartDate.getMonth() - 12);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setMonth(prevEndDate.getMonth() - 6);
      prevEndDate.setHours(23, 59, 59, 999);
      groupBy = "month";
    }

    const currentBookings = await Booking.find({
      driverDetails: driver._id,
      status: "completed",
      completedAt: { $gte: startDate, $lte: endDate },
    });

    const prevBookingsCount = await Booking.countDocuments({
      driverDetails: driver._id,
      status: "completed",
      completedAt: { $gte: prevStartDate, $lte: prevEndDate },
    });

    const total_earnings = currentBookings.reduce(
      (acc, b) => acc + (b.fare_details?.driver_charge || 0),
      0,
    );

    const prevTotalEarnings = await Booking.aggregate([
      {
        $match: {
          driverDetails: new mongoose.Types.ObjectId(driver._id),
          status: "completed",
          completedAt: { $gte: prevStartDate, $lte: prevEndDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$fare_details.driver_charge" },
        },
      },
    ]);

    const prev_earnings = prevTotalEarnings[0]?.total || 0;
    const percentage_change = prev_earnings === 0 ? 100 : ((total_earnings - prev_earnings) / prev_earnings) * 100;

    // Generate Graph Data
    let graph_data: { label: string; value: number }[] = [];
    if (filter === "today") {
      const hours = [6, 10, 14, 18, 22]; // 6 AM, 10 AM, 2 PM, 6 PM, 10 PM
      graph_data = hours.map((hour) => {
        const label = hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`;
        const value = currentBookings
          .filter((b) => {
            const h = new Date(b.completedAt).getHours();
            return h >= hour && h < hour + 4;
          })
          .reduce((acc, b) => acc + (b.fare_details?.driver_charge || 0), 0);
        return { label, value };
      });
    } else if (filter === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        const dayLabel = days[date.getDay()];
        const value = currentBookings
          .filter((b) => new Date(b.completedAt).toDateString() === date.toDateString())
          .reduce((acc, b) => acc + (b.fare_details?.driver_charge || 0), 0);
        graph_data.push({ label: dayLabel, value });
      }
    } else {
      // For monthly, 3month, 6month - group by simpler chunks
      const now = new Date(baseDate);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("default", { month: "short" });
        const value = currentBookings
          .filter((b) => {
            const bd = new Date(b.completedAt);
            return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
          })
          .reduce((acc, b) => acc + (b.fare_details?.driver_charge || 0), 0);
        graph_data.push({ label, value });
      }
    }

    // Active time (Total online hours) - Placeholder logic using trip durations
    const totalDurationMinutes = currentBookings.reduce((acc, b) => acc + (b.duration || 0), 0);
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = Math.floor(totalDurationMinutes % 60);
    const active_time_str = `${hours}h ${minutes}m`;

    return NextResponse.json({
      success: true,
      data: {
        total_earnings,
        total_trips: currentBookings.length,
        percentage_change: parseFloat(percentage_change.toFixed(1)),
        active_time: active_time_str,
        active_range: "5 AM - 10 PM", // Hardcoded per image
        wallet_balance: driver.total_earnings || 0,
        available_balance: (driver.total_earnings || 0) * 0.8, // Example calculation
        graph_data,
        filter,
      },
    });
  } catch (error: any) {
    console.error("Error in driver analytics API:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
