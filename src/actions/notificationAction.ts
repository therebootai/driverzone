import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export interface PushNotification {
  token: string;
  notification?: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  android?: {
    priority: "normal" | "high";
  };
  apns?: {
    payload: {
      aps: {
        sound?: string;
        badge?: number;
        alert?: {
          title?: string;
          body?: string;
        };
      };
    };
  };
}

export async function sendPushNotification(
  notification: PushNotification,
): Promise<string> {
  try {
    const message = {
      token: notification.token,
      notification: notification.notification,
      data: notification.data,
      android: notification.android || { priority: "high" },
      apns: notification.apns || {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            alert: notification.notification,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Push notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

export async function sendBulkNotifications(
  tokens: string[],
  notification: Omit<PushNotification, "token">,
): Promise<admin.messaging.BatchResponse> {
  try {
    const messages = tokens.map((token) => ({
      token,
      ...notification,
    }));

    const response = await admin.messaging().sendEach(messages);
    console.log(
      `Bulk notifications sent: ${response.successCount} successful, ${response.failureCount} failed`,
    );
    return response;
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    throw error;
  }
}
