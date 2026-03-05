import Alert, { AlertDocument } from "@/models/Alert";
import Booking from "@/models/Booking";
import Driver, { DriverDocument } from "@/models/Drivers";
import { calculateDistance } from "@/utils/distanceCalculator";
import mongoose from "mongoose";
import { sendPushNotification } from "./notificationAction";

export class PriorityAlertService {
  private static instance: PriorityAlertService;
  private activeAlerts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): PriorityAlertService {
    if (!PriorityAlertService.instance) {
      PriorityAlertService.instance = new PriorityAlertService();
    }
    return PriorityAlertService.instance;
  }

  /**
   * Initialize alert for a booking
   */
  async initializeAlert(bookingId: string): Promise<AlertDocument> {
    try {
      const booking = await Booking.findOne({
        $or: [
          { booking_id: bookingId },
          {
            _id: mongoose.Types.ObjectId.isValid(bookingId)
              ? new mongoose.Types.ObjectId(bookingId)
              : null,
          },
        ],
      })
        .populate("customerDetails")
        .exec();

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check if alert already exists
      const existingAlert = await Alert.findOne({ booking_id: booking._id });
      if (existingAlert) {
        return existingAlert;
      }

      // Create new alert
      const alert = new Alert({
        alert_id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        booking_id: booking._id,
        status: "active",
        priorityLevel: 1,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
        maxRetries: 3,
        retryCount: 0,
        radius: 5, // 5km initial radius
        maxDrivers: 10,
      });

      await alert.save();

      // Start the alert process
      this.processAlert((alert._id as any).toString());

      return alert;
    } catch (error) {
      console.error("Error initializing alert:", error);
      throw error;
    }
  }

  /**
   * Process alert - find and notify drivers
   */
  async processAlert(alertId: string): Promise<void> {
    try {
      const alert = await Alert.findById(alertId).populate("booking_id").exec();

      if (!alert || alert.status !== "active") {
        return;
      }

      const booking = alert.booking_id as any;

      // Find available drivers within radius
      const drivers = await this.findAvailableDrivers(
        booking.pickupLat,
        booking.pickupLng,
        alert.radius,
        alert.maxDrivers,
        alert.assignedDrivers.map((d: any) => d.driverId),
      );

      if (drivers.length === 0) {
        // No drivers found, expand radius and retry
        await this.handleNoDriversFound(alert);
        return;
      }

      // Send alerts to drivers
      await this.sendAlertsToDrivers(alert, drivers);
    } catch (error) {
      console.error("Error processing alert:", error);
    }
  }

  /**
   * Find available drivers within radius
   */
  private async findAvailableDrivers(
    lat: number,
    lng: number,
    radius: number,
    limit: number,
    excludedDriverIds: mongoose.Types.ObjectId[] = [],
  ) {
    try {
      // Find online drivers
      const filter: any = {
        isOnline: true,
        currentBooking: null,
        verified: true,
        status: true,
        _id: { $nin: excludedDriverIds },
        "currentLocation.lat": { $exists: true },
        "currentLocation.lng": { $exists: true },
      };

      // Use any to bypass "union type too complex" error
      const drivers = (await (Driver as any)
        .find(filter)
        .exec()) as DriverDocument[];

      // Calculate distances and filter by radius
      const driversWithDistance = drivers
        .map((driver) => {
          const distance = calculateDistance(
            lat,
            lng,
            driver.currentLocation.lat,
            driver.currentLocation.lng,
          );
          return { driver, distance };
        })
        .filter(({ distance }) => distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return driversWithDistance.map(({ driver }) => driver);
    } catch (error) {
      console.error("Error finding drivers:", error);
      return [];
    }
  }

  /**
   * Send alerts to multiple drivers
   */
  private async sendAlertsToDrivers(alert: any, drivers: any[]): Promise<void> {
    try {
      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];

        // Add driver to assigned list
        alert.assignedDrivers.push({
          driverId: driver._id,
          assignedAt: new Date(),
          response: "pending",
        });

        // Add alert to driver's active alerts
        driver.activeAlerts.push({
          bookingId: alert.booking_id,
          alertSentAt: new Date(),
          expiresAt: alert.expiresAt,
          status: "pending",
        });

        await driver.save();

        // Send push notification
        await this.sendDriverAlert(driver, alert);
      }

      alert.currentDriverIndex = 0;
      await alert.save();

      // Set timeout for first driver response
      if (drivers[0]) {
        this.setResponseTimeout(
          alert._id.toString(),
          drivers[0]._id.toString(),
        );
      }
    } catch (error) {
      console.error("Error sending alerts to drivers:", error);
    }
  }

  /**
   * Send push notification to driver
   */
  private async sendDriverAlert(driver: any, alert: any): Promise<void> {
    try {
      const booking = alert.booking_id as any;

      if (!driver.fcmToken) {
        console.warn(`No FCM token for driver ${driver.driver_id}`);
        return;
      }

      const notification = {
        token: driver.fcmToken,
        notification: {
          title: "New Ride Request",
          body: `Pickup: ${booking.pickupAddress}`,
        },
        data: {
          type: "ride_request",
          alertId: alert.alert_id,
          bookingId: booking.booking_id,
          pickupAddress: booking.pickupAddress,
          dropAddress: booking.dropAddress,
          fare: booking.fare?.toString(),
          distance: booking.distance?.toString(),
          expiresAt: alert.expiresAt.toISOString(),
        },
        android: {
          priority: "high" as const,
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      await sendPushNotification(notification);
    } catch (error) {
      console.error("Error sending driver alert:", error);
    }
  }

  /**
   * Handle driver response
   */
  async handleDriverResponse(
    alertId: string,
    driverId: string,
    response: "accepted" | "rejected",
  ): Promise<boolean> {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert || alert.status !== "active") {
        return false;
      }

      // Find driver in assigned list
      const driverIndex = alert.assignedDrivers.findIndex(
        (d) => d.driverId.toString() === driverId,
      );

      if (driverIndex === -1) {
        return false;
      }

      // @ts-ignore
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return false;
      }

      // Update driver's alert status
      const alertIndex = driver.activeAlerts.findIndex(
        (a) => a.bookingId.toString() === alert.booking_id.toString(),
      );

      if (alertIndex !== -1) {
        driver.activeAlerts[alertIndex].status =
          response === "accepted" ? "accepted" : "rejected";

        if (response === "rejected") {
          driver.rejectedAlerts.push({
            bookingId: alert.booking_id,
            rejectedAt: new Date(),
            reason: "Driver rejected",
          });
        }

        await driver.save();
      }

      // Update alert with response
      alert.assignedDrivers[driverIndex].respondedAt = new Date();
      alert.assignedDrivers[driverIndex].response = response;
      alert.assignedDrivers[driverIndex].responseTime =
        (new Date().getTime() -
          alert.assignedDrivers[driverIndex].assignedAt.getTime()) /
        1000;

      if (response === "accepted") {
        // Driver accepted the ride
        await this.handleDriverAcceptance(alert, driver);
        return true;
      } else {
        // Driver rejected, move to next driver
        await this.moveToNextDriver(alert);
        return false;
      }
    } catch (error) {
      console.error("Error handling driver response:", error);
      return false;
    }
  }

  /**
   * Handle driver acceptance
   */
  private async handleDriverAcceptance(alert: any, driver: any): Promise<void> {
    try {
      // Update alert status
      alert.status = "accepted";
      alert.acceptedAt = new Date();

      // Update booking with driver
      const booking = await Booking.findById(alert.booking_id);
      if (booking) {
        booking.driverDetails = driver._id;
        booking.status = "assigned";
        booking.assignedAt = new Date();
        await booking.save();
      }

      // Update driver's current booking
      driver.currentBooking = alert.booking_id;
      // Remove all active alerts for this driver
      driver.activeAlerts = driver.activeAlerts.filter(
        (a: any) => a.bookingId.toString() !== alert.booking_id.toString(),
      );
      await driver.save();

      await alert.save();

      // Clear any pending timeouts
      this.clearAlertTimeout(alert._id.toString());

      // Notify other drivers that ride is taken
      await this.notifyOtherDrivers(alert, driver._id.toString());
    } catch (error) {
      console.error("Error handling driver acceptance:", error);
    }
  }

  /**
   * Move to next available driver
   */
  private async moveToNextDriver(alert: any): Promise<void> {
    try {
      alert.currentDriverIndex++;

      // Check if we have more drivers in the current batch
      if (alert.currentDriverIndex < alert.assignedDrivers.length) {
        const nextDriver = alert.assignedDrivers[alert.currentDriverIndex];

        if (nextDriver.response === "pending") {
          // Set timeout for next driver
          this.setResponseTimeout(
            alert._id.toString(),
            nextDriver.driverId.toString(),
          );
        } else {
          // Driver already responded, skip to next
          await this.moveToNextDriver(alert);
        }
      } else {
        // All drivers in current batch responded, check if we need to retry
        await this.handleBatchCompletion(alert);
      }

      await alert.save();
    } catch (error) {
      console.error("Error moving to next driver:", error);
    }
  }

  /**
   * Handle batch completion - either retry or expand search
   */
  private async handleBatchCompletion(alert: any): Promise<void> {
    try {
      alert.retryCount++;

      if (alert.retryCount >= alert.maxRetries) {
        // Max retries reached, expire the alert
        await this.expireAlert(alert);
        return;
      }

      // Expand search radius for next retry
      alert.radius += 2; // Increase by 2km each retry

      // Clear current assignments and retry
      alert.currentDriverIndex = 0;

      // Restart the alert process
      setTimeout(() => {
        this.processAlert(alert._id.toString());
      }, 2000); // Wait 2 seconds before retrying
    } catch (error) {
      console.error("Error handling batch completion:", error);
    }
  }

  /**
   * Handle case when no drivers found
   */
  private async handleNoDriversFound(alert: any): Promise<void> {
    try {
      alert.retryCount++;

      if (alert.retryCount >= alert.maxRetries) {
        await this.expireAlert(alert);
      } else {
        // Expand radius and retry
        alert.radius += 3;
        setTimeout(() => {
          this.processAlert(alert._id.toString());
        }, 5000); // Wait 5 seconds before retrying
      }

      await alert.save();
    } catch (error) {
      console.error("Error handling no drivers found:", error);
    }
  }

  /**
   * Expire alert
   */
  private async expireAlert(alert: any): Promise<void> {
    try {
      alert.status = "expired";
      await alert.save();

      // Update booking status
      const booking = await Booking.findById(alert.booking_id);
      if (booking && booking.status === "pending") {
        booking.status = "cancelled";
        booking.cancelReason = "No drivers available";
        booking.cancelledAt = new Date();
        await booking.save();
      }

      // Clear driver active alerts
      const driverIds = alert.assignedDrivers.map((d: any) => d.driverId);
      await Driver.updateMany(
        { _id: { $in: driverIds } },
        {
          $pull: {
            activeAlerts: { bookingId: alert.booking_id },
          },
        },
      );

      // Clear timeout
      this.clearAlertTimeout(alert._id.toString());
    } catch (error) {
      console.error("Error expiring alert:", error);
    }
  }

  /**
   * Set response timeout for driver
   */
  private setResponseTimeout(alertId: string, driverId: string): void {
    const timeout = setTimeout(async () => {
      await this.handleResponseTimeout(alertId, driverId);
    }, 30000); // 30 seconds timeout

    this.activeAlerts.set(`${alertId}_${driverId}`, timeout);
  }

  /**
   * Handle response timeout
   */
  private async handleResponseTimeout(
    alertId: string,
    driverId: string,
  ): Promise<void> {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert || alert.status !== "active") {
        return;
      }

      const driverIndex = alert.assignedDrivers.findIndex(
        (d) => d.driverId.toString() === driverId && d.response === "pending",
      );

      if (driverIndex !== -1) {
        alert.assignedDrivers[driverIndex].response = "timeout";
        alert.assignedDrivers[driverIndex].respondedAt = new Date();

        // Update driver's alert status
        const driver = await Driver.findById(driverId);
        if (driver) {
          const alertIndex = driver.activeAlerts.findIndex(
            (a) => a.bookingId.toString() === alert.booking_id.toString(),
          );
          if (alertIndex !== -1) {
            driver.activeAlerts[alertIndex].status = "expired";
            await driver.save();
          }
        }

        await alert.save();

        // Move to next driver
        await this.moveToNextDriver(alert);
      }

      this.clearAlertTimeout(`${alertId}_${driverId}`);
    } catch (error) {
      console.error("Error handling response timeout:", error);
    }
  }

  /**
   * Clear alert timeout
   */
  private clearAlertTimeout(key: string): void {
    const timeout = this.activeAlerts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.activeAlerts.delete(key);
    }
  }

  /**
   * Notify other drivers that ride has been accepted
   */
  private async notifyOtherDrivers(
    alert: any,
    acceptedDriverId: string,
  ): Promise<void> {
    try {
      const otherDrivers = alert.assignedDrivers.filter(
        (d: any) =>
          d.driverId.toString() !== acceptedDriverId &&
          d.response === "pending",
      );

      for (const assignedDriver of otherDrivers) {
        const driver = await Driver.findById(assignedDriver.driverId);
        if (driver && driver.fcmToken) {
          await sendPushNotification({
            token: driver.fcmToken,
            data: {
              type: "ride_cancelled",
              alertId: alert.alert_id,
              message: "Ride has been accepted by another driver",
            },
          });

          // Remove alert from driver's active alerts
          driver.activeAlerts = driver.activeAlerts.filter(
            (a: any) => a.bookingId.toString() !== alert.booking_id.toString(),
          );
          await driver.save();
        }
      }
    } catch (error) {
      console.error("Error notifying other drivers:", error);
    }
  }

  /**
   * Cancel alert
   */
  async cancelAlert(alertId: string): Promise<boolean> {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert) {
        return false;
      }

      alert.status = "cancelled";
      alert.cancelledAt = new Date();
      await alert.save();

      // Notify all assigned drivers
      await this.notifyDriversOfCancellation(alert);

      // Clear all timeouts
      for (const assignedDriver of alert.assignedDrivers) {
        this.clearAlertTimeout(`${alertId}_${assignedDriver.driverId}`);
      }

      // Clear from drivers' active alerts
      const driverIds = alert.assignedDrivers.map((d: any) => d.driverId);
      await Driver.updateMany(
        { _id: { $in: driverIds } },
        {
          $pull: {
            activeAlerts: { bookingId: alert.booking_id },
          },
        },
      );

      return true;
    } catch (error) {
      console.error("Error cancelling alert:", error);
      return false;
    }
  }

  /**
   * Notify drivers of alert cancellation
   */
  private async notifyDriversOfCancellation(alert: any): Promise<void> {
    try {
      for (const assignedDriver of alert.assignedDrivers) {
        const driver = await Driver.findById(assignedDriver.driverId);
        if (driver && driver.fcmToken) {
          await sendPushNotification({
            token: driver.fcmToken,
            data: {
              type: "alert_cancelled",
              alertId: alert.alert_id,
              message: "Ride alert has been cancelled",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error notifying drivers of cancellation:", error);
    }
  }
}

export default PriorityAlertService.getInstance();
