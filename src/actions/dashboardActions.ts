import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Customers from "@/models/Customers";
import Drivers from "@/models/Drivers";

await ensureModelsRegistered();

export const GET_ANALYTICS = async () => {
  try {
    await connectToDatabase();
    // Get driver counts
    const totalDrivers = await Drivers.countDocuments();
    const activeDrivers = await Drivers.countDocuments({ status: true });

    // Get customer counts
    const totalCustomers = await Customers.countDocuments();
    const activeCustomers = await Customers.countDocuments({ status: true });

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
        },
      },
    };
  }
};
