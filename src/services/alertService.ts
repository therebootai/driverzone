import Alert, { AlertDocument } from "@/models/Alert";
import Booking from "@/models/Booking";
import Driver, { DriverDocument } from "@/models/Drivers";
import { calculateDistance } from "@/utils/distanceCalculator";
import mongoose from "mongoose";
import { sendPushNotification } from "@/actions/notificationAction";
import { socketService, EVENTS } from "@/lib/socket";
import { autoOfflineStaleDrivers } from "@/utils/driverUtils";

export class PriorityAlertService {
  private static instance: PriorityAlertService;
  private activeAlerts: Map<string, NodeJS.Timeout> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
      let alert = await Alert.findOne({ booking_id: booking._id });

      if (alert) {
        // If alert exists but not active, reset it to allow re-triggering
        if (alert.status !== "active") {
          alert.status = "active";
          alert.radius = 10;
          alert.retryCount = 0;
          alert.assignedDrivers = [] as any;
          alert.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
          await alert.save();
          this.processAlert((alert as any)._id.toString());
        }
        return alert;
      }

      // Create new alert
      alert = new Alert({
        alert_id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        booking_id: booking._id,
        status: "active",
        priorityLevel: 1,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
        maxRetries: 10, // Increased max retries for better availability
        retryCount: 0,
        radius: 10,
        maxDrivers: 10,
      });

      await alert.save();

      // Start the alert process
      this.processAlert((alert as any)._id.toString());

      // Notify admin of new active alert
      socketService.emit(
        EVENTS.BOOKING_CREATED,
        {
          bookingId: booking._id,
          alertId: alert._id,
        },
        "admin",
      );

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
      // Exclude ALL drivers who have already been assigned to this alert.
      // This forces the system to move to the next nearby driver if the first one doesn't respond.
      const excludedDriverIds = alert.assignedDrivers.map(
        (d: any) => d.driverId,
      );

      // Populate package_type to check for hills_tour
      const populatedBooking = await Booking.findById(booking._id || booking)
        .populate("package_type")
        .lean();
      const packageType = populatedBooking?.package_type as any;
      const bookingPackageType = packageType?.package_type;

      // Parse vehicleType from booking (e.g. "SUV - Mannual") into category and transmission
      const vehicleTypeStr: string = booking.vehicleType || "";
      const [bookingCategory, bookingTransmission] = vehicleTypeStr
        .split(" - ")
        .map((s: string) => s.trim().toLowerCase());

      const drivers = await this.findAvailableDrivers(
        booking.pickupLat,
        booking.pickupLng,
        alert.radius,
        alert.maxDrivers,
        excludedDriverIds,
        bookingPackageType,
        bookingCategory,
        bookingTransmission,
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
    bookingPackageType?: string,
    bookingCategory?: string,
    bookingTransmission?: string,
  ) {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await autoOfflineStaleDrivers();

      // Find online drivers not already busy with another alert
      const filter: any = {
        isOnline: true,
        verified: true,
        status: true,
        fcmToken: { $exists: true, $ne: "" },
        _id: { $nin: excludedDriverIds },
        "currentLocation.lat": { $exists: true },
        "currentLocation.lng": { $exists: true },
        "currentLocation.lastUpdated": { $gte: twoHoursAgo },
        $or: [
          { currentBooking: null },
          { currentBooking: { $exists: false } },
        ],
        $and: [
          {
            $or: [
              { activeAlerts: null },
              { activeAlerts: { $exists: false } },
              { "activeAlerts.bookingId": { $exists: false } },
              { "activeAlerts.bookingId": null },
            ],
          },
        ],
      };

      if (bookingPackageType) {
        filter.speciality = bookingPackageType;
      }

      // Filter by vehicle category type
      // Only apply if the booking category exists in the driver enum
      const driverCategories = [
        "SUV",
        "Hatchback",
        "Sedan",
        "Mini",
        "Van",
        "Others",
      ];
      const categoryLookup = bookingCategory
        ? bookingCategory.charAt(0).toUpperCase() + bookingCategory.slice(1)
        : null;
      if (categoryLookup && driverCategories.includes(categoryLookup)) {
        filter.vehicle_category_type = { $in: [categoryLookup, "Others"] };
      }

      // Filter by vehicle transmission type
      if (bookingTransmission) {
        const normalizedTransmission =
          bookingTransmission.charAt(0).toUpperCase() +
          bookingTransmission.slice(1);
        // "Automatic+Manual" drivers can handle either
        filter.vehicle_transmission_type = {
          $in: [normalizedTransmission, "Automatic+Manual"],
        };
      }

      // Diagnostic logging
      const onlineDriversCount = await Driver.countDocuments({
        isOnline: true,
      });
      const onlineAndVerifiedCount = await Driver.countDocuments({
        isOnline: true,
        verified: true,
      });
      const onlineVerifiedWithTokenCount = await Driver.countDocuments({
        isOnline: true,
        verified: true,
        fcmToken: { $exists: true, $ne: "" },
      });
      console.log(
        `[AlertService] Diagnostic: Online: ${onlineDriversCount}, Verified: ${onlineAndVerifiedCount}, With Token: ${onlineVerifiedWithTokenCount}`,
      );

      // Use any to bypass "union type too complex" error
      const drivers = (await (Driver as any)
        .find(filter)
        .exec()) as DriverDocument[];

      console.log(
        `[AlertService] Found ${drivers.length} potential drivers after DB query (status/token filters)`,
      );

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
      // Re-verify alert is still active before sending (guards against race conditions)
      const freshAlert = await Alert.findById(alert._id);
      if (!freshAlert || freshAlert.status !== "active") {
        console.log(`Alert ${alert._id} no longer active, skipping dispatch`);
        return;
      }

      // Only send alert to the first driver initially
      if (drivers.length > 0) {
        const firstDriver = drivers[0];

        // Add driver to assigned list
        alert.assignedDrivers.push({
          driverId: firstDriver._id,
          assignedAt: new Date(),
          response: "pending",
        });

        // Set alert as driver's active alert
        firstDriver.activeAlerts = {
          bookingId: alert.booking_id._id || alert.booking_id,
          alertSentAt: new Date(),
          expiresAt: alert.expiresAt,
          status: "pending",
        };

        await firstDriver.save();

        // Send push notification to the first driver
        await this.sendDriverAlert(firstDriver, alert);

        // Also emit via socket for instant delivery if driver is connected
        const socketBooking = alert.booking_id;
        const socketPopulatedBooking = await Booking.findById(
          socketBooking._id || socketBooking,
        )
          .populate("package_type")
          .lean();
        const socketPackageType = socketPopulatedBooking?.package_type as any;

        socketService.emit(
          EVENTS.RIDE_REQUEST,
          {
            type: EVENTS.RIDE_REQUEST,
            alertId: (alert._id as any).toString(),
            alertSlug: alert.alert_id,
            bookingId: (socketBooking._id || socketBooking).toString(),
            pickupAddress: socketBooking.pickupAddress,
            dropAddress: socketBooking.dropAddress,
            fare: socketBooking.fare,
            vehicleType: socketBooking.vehicleType || "",
            tripType: socketBooking.tripType || "",
            serviceCategory: socketPackageType?.package_type || "",
            paymentMethod: socketBooking.paymentMethod || "",
            stopAddress: socketBooking.stopAddress || "",
            customerName: socketBooking.customerDetails?.name || "Customer",
            customerMobile: socketBooking.customerDetails?.mobile_number || "",
            dropZoneName: socketPackageType?.drop_zone?.name || "",
            expiresAt: alert.expiresAt,
          },
          `driver:${firstDriver._id}`,
        );

        alert.currentDriverIndex = 0;
        await alert.save();

        // Set timeout for first driver response
        this.setResponseTimeout(
          (alert._id as any).toString(),
          (firstDriver._id as any).toString(),
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

      // Populate package_type to extract serviceCategory and dropZoneName
      const populatedBooking = await Booking.findById(booking._id)
        .populate("package_type")
        .lean();
      const packageType = populatedBooking?.package_type as any;

      let dropZoneName = "";
      if (packageType?.drop_zone) {
        dropZoneName = packageType.drop_zone.name || "";
      }

      const payload: any = {
        token: driver.fcmToken,
        notification: {
          title: "New Ride Request",
          body: `New ride request from ${booking.pickupAddress}`,
        },
        data: {
          title: "New Ride Request",
          body: `New ride request from ${booking.pickupAddress}`,
          type: "ride_request",
          alertId: (alert._id as any).toString(),
          alertSlug: alert.alert_id,
          bookingId: (booking._id as any).toString(),
          pickupAddress: booking.pickupAddress,
          dropAddress: booking.dropAddress,
          fare: (booking.fare || "").toString(),
          customerName: booking.customerDetails?.name || "Customer",
          customerMobile: booking.customerDetails?.mobile_number || "",
          vehicleType: booking.vehicleType || "",
          tripType: booking.tripType || "",
          serviceCategory: packageType?.package_type || "",
          paymentMethod: booking.paymentMethod || "",
          stopAddress: booking.stopAddress || "",
          dropZoneName,
          distance: booking.distance?.toString() || "",
          tripDuration: booking.duration?.toString() || "",
          duration: (alert.expiresAt.getTime() - Date.now() > 0
            ? Math.floor((alert.expiresAt.getTime() - Date.now()) / 1000)
            : 30
          ).toString(),
        },
        android: {
          priority: "high" as const,
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              "content-available": 1,
            },
          },
        },
      };

      try {
        await sendPushNotification(payload);
        console.log(
          `Notification sent to driver ${driver.driver_name} (${driver._id})`,
        );
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.error(`FCM SEND ERROR for driver ${driver._id}:`, errorMsg);

        // Handle stale/invalid tokens (404 Not Found in FCM v1)
        if (
          errorMsg.includes("Requested entity was not found") ||
          errorMsg.includes("registration-token-not-registered") ||
          errorMsg.includes("404")
        ) {
          console.warn(
            `Cleaning up invalid FCM token for driver ${driver._id}`,
          );
          // Use the actual Drivers model for update
          const DriverModel = (await import("@/models/Drivers")).default;
          await DriverModel.findByIdAndUpdate(driver._id, {
            $unset: { fcmToken: "" },
          });
        }
      }
    } catch (error) {
      console.error("Error in sendDriverAlert wrapper:", error);
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
      const alert = await Alert.findOne({
        $or: [
          {
            _id: mongoose.Types.ObjectId.isValid(alertId)
              ? new mongoose.Types.ObjectId(alertId)
              : null,
          },
          { alert_id: alertId },
        ],
      });

      if (!alert) return false;
      if (alert.status !== "active" && response !== "rejected") return false;

      // Find driver in assigned list
      const driverIndex = alert.assignedDrivers.findIndex(
        (d) => d.driverId?.toString() === driverId,
      );

      if (driverIndex === -1) {
        return false;
      }

      // Prevent timed-out drivers from accepting after their per-driver window expired
      const driverResponse = alert.assignedDrivers[driverIndex].response;
      if (response === "accepted" && driverResponse !== "pending") {
        console.log(`Driver ${driverId} response is "${driverResponse}", cannot accept`);
        return false;
      }

      
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return false;
      }

      // Update driver's alert status
      if (
        driver.activeAlerts &&
        driver.activeAlerts.bookingId?.toString() ===
          alert.booking_id?.toString()
      ) {
        driver.activeAlerts = null;

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
      driver.activeAlerts = null;
      await driver.save();

      await alert.save();

      // Clear all pending timeouts for this alert
      this.clearAllAlertTimeouts((alert._id as any).toString());

      // Notify relevant parties via socket
      socketService.emit(
        EVENTS.BOOKING_ACCEPTED,
        {
          type: EVENTS.BOOKING_ACCEPTED,
          bookingId: alert.booking_id?.toString(),
          status: "assigned",
          driverDetails: {
            _id: driver._id,
            driver_name: driver.driver_name,
            mobile_number: driver.mobile_number,
            vehicle_number: driver.vehicle_number,
            currentLocation: driver.currentLocation,
          },
        },
        `ride:${alert.booking_id}`,
      );

      // Notify admin
      socketService.emit(
        EVENTS.BOOKING_UPDATED,
        {
          type: EVENTS.BOOKING_UPDATED,
          bookingId: alert.booking_id?.toString(),
          status: "assigned",
        },
        "admin",
      );

      // Notify other drivers that ride is taken
      await this.notifyOtherDrivers(alert, (driver._id as any).toString());

      // Notify customer and admin of acceptance
      socketService.emit(
        EVENTS.BOOKING_ACCEPTED,
        {
          bookingId: alert.booking_id,
          driverId: driver._id,
          driverName: driver.driver_name,
          driverPhone: driver.mobile_number,
          vehicleNumber: driver.vehicle_details?.vehicle_number,
        },
        `ride:${alert.booking_id}`,
      );

      socketService.emit(
        EVENTS.BOOKING_UPDATED,
        {
          bookingId: alert.booking_id,
          status: "assigned",
        },
        "admin",
      );
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
        const nextDriverData = alert.assignedDrivers[alert.currentDriverIndex];

        if (nextDriverData.response === "pending") {
          // Fetch the driver to send alert and set activeAlerts
          const driver = await Driver.findById(nextDriverData.driverId);
          if (driver) {
            driver.activeAlerts = {
              bookingId: alert.booking_id,
              alertSentAt: new Date(),
              expiresAt: alert.expiresAt,
              status: "pending",
            };
            await driver.save();

            // Send push notification to the next driver
            await this.sendDriverAlert(driver, alert);

            // Also emit via socket for instant delivery
            const nextBooking = alert.booking_id;
            const retryPopulatedBooking = await Booking.findById(
              nextBooking._id || nextBooking,
            )
              .populate("package_type")
              .lean();
            const retryPackageType = retryPopulatedBooking?.package_type as any;

            socketService.emit(
              EVENTS.RIDE_REQUEST,
              {
                type: EVENTS.RIDE_REQUEST,
                alertId: (alert._id as any).toString(),
                alertSlug: alert.alert_id,
                bookingId: (nextBooking._id || nextBooking).toString(),
                pickupAddress: nextBooking.pickupAddress,
                dropAddress: nextBooking.dropAddress,
                fare: nextBooking.fare,
                vehicleType: nextBooking.vehicleType || "",
                tripType: nextBooking.tripType || "",
                serviceCategory: retryPackageType?.package_type || "",
                paymentMethod: nextBooking.paymentMethod || "",
                stopAddress: nextBooking.stopAddress || "",
                customerName: nextBooking.customerDetails?.name || "Customer",
                customerMobile:
                  nextBooking.customerDetails?.mobile_number || "",
                dropZoneName: retryPackageType?.drop_zone?.name || "",
                expiresAt: alert.expiresAt,
              },
              `driver:${driver._id}`,
            );

            // Set timeout for next driver
            this.setResponseTimeout(
              (alert._id as any).toString(),
              (nextDriverData.driverId as any).toString(),
            );
          } else {
            // Driver not found, skip to next
            await this.moveToNextDriver(alert);
          }
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
      const retryTimeout = setTimeout(() => {
        this.retryTimeouts.delete((alert._id as any).toString());
        this.processAlert((alert._id as any).toString());
      }, 2000); // Wait 2 seconds before retrying
      this.retryTimeouts.set((alert._id as any).toString(), retryTimeout);
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
        const retryTimeout = setTimeout(() => {
          this.retryTimeouts.delete((alert._id as any).toString());
          this.processAlert((alert._id as any).toString());
        }, 5000); // Wait 5 seconds before retrying
        this.retryTimeouts.set((alert._id as any).toString(), retryTimeout);
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

      // Update booking status - User requested to keep it pending
      const booking = await Booking.findById(alert.booking_id);
      if (booking && booking.status === "pending") {
        console.log(
          `Alert ${alert._id} expired, booking ${booking._id} remains pending.`,
        );
      }

      // Clear driver active alerts
      const driverIds = alert.assignedDrivers.map((d: any) => d.driverId);
      await Driver.updateMany(
        { _id: { $in: driverIds } },
        {
          $set: {
            activeAlerts: null,
          },
        },
      );

      // Notify all assigned drivers that the alert expired
      const bookingIdStr = alert.booking_id?.toString() || "";
      for (const assignedDriver of alert.assignedDrivers) {
        const driverIdStr = assignedDriver.driverId?.toString();
        if (!driverIdStr) continue;

        try {
          socketService.emit(
            EVENTS.ALERT_CANCELLED,
            {
              type: EVENTS.ALERT_CANCELLED,
              alertId: (alert._id as any).toString(),
              alertSlug: alert.alert_id,
              bookingId: bookingIdStr,
              message: "Ride alert has expired",
            },
            `driver:${driverIdStr}`,
          );

          const driver = await Driver.findById(assignedDriver.driverId);
          if (driver && driver.fcmToken) {
            await sendPushNotification({
              token: driver.fcmToken,
              data: {
                type: "alert_cancelled",
                alertId: (alert._id as any).toString(),
                bookingId: bookingIdStr,
                message: "Ride alert has expired",
              },
            });
          }
        } catch (notifyErr) {
          console.error("Error notifying driver of expiry:", notifyErr);
        }
      }

      // Clear timeout
      this.clearAlertTimeout((alert._id as any).toString());
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
        (d) => d.driverId?.toString() === driverId && d.response === "pending",
      );

      if (driverIndex !== -1) {
        alert.assignedDrivers[driverIndex].response = "timeout";
        alert.assignedDrivers[driverIndex].respondedAt = new Date();

        // Update driver's alert status
        const driver = await Driver.findById(driverId);
        if (driver) {
          if (
            driver.activeAlerts &&
            driver.activeAlerts.bookingId?.toString() ===
              alert.booking_id?.toString()
          ) {
            driver.activeAlerts.status = "expired";
            await driver.save();
          }
        }

        await alert.save();

        // Do NOT send ALERT_CANCELLED to the timed-out driver — let the TripAlert
        // stay visible until the backend's expiresAt fires or a genuine cancellation
        // occurs. The driver can still accept/reject within the full alert window.
        // The backend will reject stale acceptances via the guard in handleDriverResponse.

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
   * Clear all timeouts for a given alert
   */
  private clearAllAlertTimeouts(alertId: string): void {
    for (const [key, timeout] of this.activeAlerts.entries()) {
      if (key.startsWith(`${alertId}_`)) {
        clearTimeout(timeout);
        this.activeAlerts.delete(key);
      }
    }
    // Also clear any pending retry timeouts for this alert
    const retryTimeout = this.retryTimeouts.get(alertId);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      this.retryTimeouts.delete(alertId);
    }
  }

  /**
   * Cancel alert by booking ID
   */
  async cancelAlertByBookingId(bookingId: string): Promise<boolean> {
    try {
      const alert = await Alert.findOne({
        $or: [
          {
            booking_id: mongoose.Types.ObjectId.isValid(bookingId)
              ? new mongoose.Types.ObjectId(bookingId)
              : null,
          },
          { booking_id: bookingId },
        ],
        status: { $in: ["active", "accepted"] },
      });

      if (!alert) {
        // Even if alert is not found, we should ensure any driver's activeAlerts are cleared for this booking
        await Driver.updateMany(
          { "activeAlerts.bookingId": bookingId },
          { $set: { activeAlerts: null } },
        );
        return false;
      }

      return this.cancelAlert((alert._id as any).toString());
    } catch (error) {
      console.error("Error cancelling alert by booking ID:", error);
      return false;
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
          d.driverId?.toString() !== acceptedDriverId &&
          (d.response === "pending" || d.response === "timeout"),
      );

      for (const assignedDriver of otherDrivers) {
        const driverIdStr = assignedDriver.driverId?.toString();
        if (!driverIdStr) continue;
        const bookingIdStr = alert.booking_id?._id
          ? (alert.booking_id._id as any).toString()
          : alert.booking_id?.toString();
        if (!bookingIdStr) continue;

        // Emit socket event for instant dismissal
        socketService.emit(
          EVENTS.ALERT_CANCELLED,
          {
            type: EVENTS.ALERT_CANCELLED,
            alertId: (alert._id as any).toString(),
            alertSlug: alert.alert_id,
            bookingId: bookingIdStr,
            message: "Ride has been accepted by another driver",
          },
          `driver:${driverIdStr}`,
        );

        // Also emit booking:accepted so the client's existing listener handles it
        socketService.emit(
          EVENTS.BOOKING_ACCEPTED,
          {
            type: EVENTS.BOOKING_ACCEPTED,
            bookingId: bookingIdStr,
            driverId: acceptedDriverId,
            message: "Ride taken by another driver",
          },
          `driver:${driverIdStr}`,
        );

        const driver = await Driver.findById(assignedDriver.driverId);
        if (driver && driver.fcmToken) {
          await sendPushNotification({
            token: driver.fcmToken,
            data: {
              type: "alert_cancelled",
              alertId: (alert._id as any).toString(),
              alertSlug: alert.alert_id,
              _id: bookingIdStr,
              bookingId: bookingIdStr,
              message: "Ride has been accepted by another driver",
            },
          });

          // Clear alert from driver's active alerts
          if (
            driver.activeAlerts &&
            driver.activeAlerts.bookingId?.toString() ===
              alert.booking_id?.toString()
          ) {
            driver.activeAlerts = null;
          }
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

      // Notify relevant parties via socket
      socketService.emit(
        EVENTS.BOOKING_CANCELLED,
        {
          type: EVENTS.BOOKING_CANCELLED,
          bookingId: alert.booking_id?.toString(),
          reason: "Cancelled by Admin/Service",
        },
        `ride:${alert.booking_id}`,
      );

      // Also notify admin room
      socketService.emit(
        EVENTS.BOOKING_CANCELLED,
        {
          type: EVENTS.BOOKING_CANCELLED,
          bookingId: alert.booking_id?.toString(),
          reason: "Cancelled by Admin/Service",
        },
        "admin",
      );

      socketService.emit(
        EVENTS.ALERT_CANCELLED,
        {
          alertId: alert.alert_id,
        },
        "admin",
      );

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
          $set: {
            activeAlerts: null,
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
        // Notify via socket for instant dismissal
        if (assignedDriver.driverId) {
          const driverIdStr = assignedDriver.driverId?.toString();

          // Emit BOOKING_CANCELLED to driver's room so handleRideCancelled fires
          // and clears currentBooking (the ride:<bookingId> room emission never
          // reaches the driver since they only join driver:<id>)
          socketService.emit(
            EVENTS.BOOKING_CANCELLED,
            {
              type: EVENTS.BOOKING_CANCELLED,
              bookingId: alert.booking_id?.toString(),
              reason: "Ride has been cancelled",
            },
            `driver:${driverIdStr}`,
          );

          socketService.emit(
            EVENTS.ALERT_CANCELLED,
            {
              type: EVENTS.ALERT_CANCELLED,
              alertId: (alert._id as any).toString(),
              alertSlug: alert.alert_id,
              bookingId: alert.booking_id?.toString(),
              message: "Ride alert has been cancelled",
            },
            `driver:${driverIdStr}`,
          );
        }

        const driver = await Driver.findById(assignedDriver.driverId);
        if (driver && driver.fcmToken) {
          await sendPushNotification({
            token: driver.fcmToken,
            data: {
              type: "alert_cancelled",
              alertId: (alert._id as any).toString(),
              alertSlug: alert.alert_id,
              bookingId: alert.booking_id?.toString(),
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

export const alertService = PriorityAlertService.getInstance();
