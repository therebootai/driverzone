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

    // Optimization: Use MongoDB Aggregation for all major metrics in a single pass
    const statsResult = await Booking.aggregate([
      {
        $match: {
          driverDetails: new mongoose.Types.ObjectId(driver._id),
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total_earnings: { $sum: "$fare_details.driver_charge" },
          total_trips: { $sum: 1 },
          total_duration: { $sum: "$duration" },
        },
      },
    ]);

    const { total_earnings = 0, total_trips = 0, total_duration = 0 } = statsResult[0] || {};

    const prevStatsResult = await Booking.aggregate([
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
          total_earnings: { $sum: "$fare_details.driver_charge" },
        },
      },
    ]);

    const prev_earnings = prevStatsResult[0]?.total_earnings || 0;
    const percentage_change = prev_earnings === 0 ? 100 : ((total_earnings - prev_earnings) / prev_earnings) * 100;

    // Generate Graph Data using Aggregation
    let graphAgg: any[] = [];
    if (filter === "today") {
      graphAgg = await Booking.aggregate([
        {
          $match: {
            driverDetails: new mongoose.Types.ObjectId(driver._id),
            status: "completed",
            completedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $hour: "$completedAt" },
            value: { $sum: "$fare_details.driver_charge" },
          },
        },
      ]);
    } else {
      graphAgg = await Booking.aggregate([
        {
          $match: {
            driverDetails: new mongoose.Types.ObjectId(driver._id),
            status: "completed",
            completedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
            value: { $sum: "$fare_details.driver_charge" },
          },
        },
      ]);
    }

    // Process graph data into labels
    let graph_data: { label: string; value: number }[] = [];
    if (filter === "today") {
      const hours = [6, 10, 14, 18, 22];
      graph_data = hours.map((h) => {
        const label = h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`;
        const match = graphAgg.find((g) => g._id >= h && g._id < h + 4);
        return { label, value: match ? match.value : 0 };
      });
    } else if (filter === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayLabel = days[date.getDay()];
        const match = graphAgg.find((g) => g._id === dateStr);
        graph_data.push({ label: dayLabel, value: match ? match.value : 0 });
      }
    } else {
      // Monthly/3month/6month logic simplified to monthly buckets
      const now = new Date(baseDate);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("default", { month: "short" });
        const prefix = d.toISOString().split("-").slice(0, 2).join("-");
        const match = graphAgg.filter((g) => g._id.startsWith(prefix)).reduce((acc, curr) => acc + curr.value, 0);
        graph_data.push({ label, value: match });
      }
    }

    // Active time string
    const hours = Math.floor(total_duration / 60);
    const minutes = Math.floor(total_duration % 60);
    const active_time_str = `${hours}h ${minutes}m`;


    return NextResponse.json({
      success: true,
      data: {
        total_earnings,
        total_trips,
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
