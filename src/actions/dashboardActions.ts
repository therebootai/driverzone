"use server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Customers from "@/models/Customers";
import Drivers from "@/models/Drivers";
import Booking from "@/models/Booking";
import { autoOfflineStaleDrivers } from "@/utils/driverUtils";

await ensureModelsRegistered();

export const GET_ANALYTICS = async () => {
  try {
    await connectToDatabase();
    await autoOfflineStaleDrivers();
    // Get driver counts
    const totalDrivers = await Drivers.countDocuments();
    const activeDrivers = await Drivers.countDocuments({ status: true });

    // Get customer counts
    const totalCustomers = await Customers.countDocuments();
    const activeCustomers = await Customers.countDocuments({ status: true });

    // Get completed rides
    const completedRides = await Booking.countDocuments({ status: "completed" });

    return {
      success: true,
      data: {
        drivers: {
          total: totalDrivers,
          active: activeDrivers,
          inactive: totalDrivers - activeDrivers,
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          inactive: totalCustomers - activeCustomers,
        },
        summary: {
          total_users: totalDrivers + totalCustomers,
          active_users: activeDrivers + activeCustomers,
          inactive_users:
            totalDrivers - activeDrivers + (totalCustomers - activeCustomers),
          completed_rides: completedRides,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return {
      success: false,
      message: error.message,
      data: {
        drivers: {
          total: 0,
          active: 0,
          inactive: 0,
        },
        customers: {
          total: 0,
          active: 0,
          inactive: 0,
        },
        summary: {
          total_users: 0,
          active_users: 0,
          inactive_users: 0,
          completed_rides: 0,
        },
      },
    };
  }
};

export const GET_WEEKLY_BOOKINGS = async (year: number, month: number) => {
  try {
    await connectToDatabase();
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const bookings = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $project: {
          dayOfMonth: { $dayOfMonth: "$createdAt" },
        }
      },
      {
        $group: {
          _id: {
            $ceil: { $divide: ["$dayOfMonth", 7] }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const maxWeeks = Math.ceil(endDate.getDate() / 7);
    const weeklyData = Array.from({ length: maxWeeks }, (_, i) => ({
      name: `Week ${i + 1}`,
      bookings: 0
    }));
    
    let total = 0;
    
    bookings.forEach((b) => {
      const weekIndex = b._id - 1;
      if (weekIndex >= 0 && weekIndex < maxWeeks) {
        weeklyData[weekIndex].bookings = b.count;
        total += b.count;
      }
    });

    return { success: true, data: weeklyData, total };
  } catch (error: any) {
    console.error("Error fetching weekly bookings:", error);
    return { success: false, message: error.message, data: [], total: 0 };
  }
};

