"use server";
import { alertService } from "@/services/alertService";

/**
 * Server Action to manually trigger or retry an alert
 */
export async function triggerDriverAlert(bookingId: string) {
  try {
    const alert = await alertService.initializeAlert(bookingId);
    
    return { success: true, message: "Alert triggered successfully", alertId: (alert as any)._id.toString() };
  } catch (error: any) {
    console.error("Manual alert trigger failed:", error);
    return { success: false, error: error.message || "Failed to trigger alert" };
  }
}
