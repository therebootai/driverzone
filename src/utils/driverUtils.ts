import connectToDatabase from "@/db/connection";
import Driver from "@/models/Drivers";

/**
 * Automatically sets drivers to offline if their location hasn't been updated for 2 hours.
 * 
 * @returns Object indicating the number of drivers offlined.
 */
export async function autoOfflineStaleDrivers() {
  try {
    await connectToDatabase();
    // 2 hours ago
    const threshold = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const result = await Driver.updateMany(
      {
        isOnline: true,
        $or: [
          { "currentLocation.lastUpdated": { $lt: threshold } },
          { "currentLocation.lastUpdated": { $exists: false } },
          { "currentLocation.lastUpdated": null }
        ]
      },
      {
        $set: { isOnline: false }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[DriverUtil] Auto-offlined ${result.modifiedCount} stale drivers (last update > 2h)`);
    }

    return { 
      success: true, 
      modifiedCount: result.modifiedCount 
    };
  } catch (error) {
    console.error("[DriverUtil] Error auto-offlining drivers:", error);
    return { 
      success: false, 
      error 
    };
  }
}
