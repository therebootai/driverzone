import Customer from "@/models/Customers";
import Notification from "@/models/Notification";
import { sendPushNotification } from "@/actions/notificationAction";

interface SendCustomerNotificationParams {
  customerId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Sends a notification to a customer:
 * 1. Creates a Notification document in the DB with recipientType "customer"
 * 2. Retrieves the customer's fcmToken from the DB
 * 3. Sends an FCM push notification via sendPushNotification
 */
export async function sendCustomerNotification({
  customerId,
  title,
  body,
  data,
}: SendCustomerNotificationParams): Promise<void> {
  // 1. Create notification document in DB
  await Notification.create({
    recipientId: customerId,
    recipientType: "customer",
    title,
    body,
    data: data ?? undefined,
    isRead: false,
  });

  // 2. Get customer's fcmToken
  const customer = await Customer.findById(customerId).select("fcmToken").lean();

  if (!customer?.fcmToken) {
    console.warn(
      `No fcmToken found for customer ${customerId}; skipping push notification.`,
    );
    return;
  }

  // 3. Send FCM push notification
  try {
    await sendPushNotification({
      token: customer.fcmToken,
      notification: { title, body },
      data,
    });
  } catch (error) {
    console.error(
      `Failed to send push notification to customer ${customerId}:`,
      error,
    );
  }
}

/**
 * Returns a default { title, body } for a given booking status.
 */
export function getNotificationForStatus(
  status: string,
): { title: string; body: string } {
  const map: Record<string, { title: string; body: string }> = {
    accepted: {
      title: "Driver Accepted",
      body: "Your booking has been accepted by a driver. Get ready!",
    },
    arrived: {
      title: "Driver Arrived",
      body: "Your driver has arrived at the pickup location.",
    },
    started: {
      title: "Trip Started",
      body: "Your trip has started. Enjoy the ride!",
    },
    completed: {
      title: "Trip Completed",
      body: "Your trip has been completed. Thank you for riding with us!",
    },
    cancelled: {
      title: "Booking Cancelled",
      body: "Your booking has been cancelled.",
    },
  };

  return (
    map[status] ?? {
      title: "Booking Update",
      body: `Your booking status has been updated to ${status}.`,
    }
  );
}
