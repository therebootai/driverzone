import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Booking from "@/models/Booking";
import Driver from "@/models/Drivers";
import Customer from "@/models/Customers";
import { verifyCustomerToken, verifyDriverToken } from "@/utils/jwt";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import mongoose from "mongoose";
import { socketService, EVENTS as SOCKET_EVENTS } from "@/lib/socket";
import { calculateBookingCharges, parseScheduleDateTime } from "@/utils/fareCalculator";
import { sendCustomerNotification, getNotificationForStatus } from "@/utils/sendCustomerNotification";

const RESTRICTED_FIELDS = ["booking_id", "driverDetails", "customerDetails"];

// Fields that customers ARE allowed to update
const ALLOWED_FIELDS = [
  "otp_verified_at",
  "assignedAt",
  "acceptedAt",
  "arrivedAt",
  "startedAt",
  "completedAt",
  "cancelledAt",
  "assignedAt",
  "driverRating",
  "otp_verified",
  "pickupAddress",
  "pickupLat",
  "pickupLng",
  "dropAddress",
  "dropLat",
  "dropLng",
  "tripType",
  "distance",
  "duration",
  "vehicleType",
  "paymentMethod",
  "paymentStatus",
  "paid_amount",
  "cancelReason", // Only for cancellation
  "schedule_date",
  "schedule_time",
  "insurance",
  "otp",
  "status",
  "customerRating",
  "customerTags",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await connectToDatabase();
    await ensureModelsRegistered();

    const requestedBooking = await Booking.findOne({
      $or: [{ _id: isValidObjectId(id) ? id : undefined }, { booking_id: id }],
    })
      .populate("driverDetails")
      .populate({
        path: "package_type",
        populate: [
          { path: "drop_zone", select: "name" },
          { path: "main_zone", select: "name" },
          { path: "service_zone", select: "name" },
        ],
      })
      .populate("coupon")
      .populate("customerDetails");

    if (!requestedBooking) {
      return NextResponse.json(
        { message: "Booking not found", success: false },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { booking: requestedBooking, success: true },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get the booking ID from params
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 },
      );
    }

    const token = request.headers.get("authorization");
    let user;
    let driver;
    await connectToDatabase();
    await ensureModelsRegistered();
    if (token) {
      user = await verifyCustomerToken(token.split("Bearer ")[1]);
      driver = await verifyDriverToken(token.split("Bearer ")[1]);
    }

    if (!user && !driver) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get request body
    const updateData = await request.json();

    // Find the booking
    const existingBooking = await Booking.findOne({
      $or: [
        { _id: isValidObjectId(bookingId) ? bookingId : undefined },
        { booking_id: bookingId },
      ],
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    // Security check: If driver is updating, ensure they are assigned to this booking
    if (driver && existingBooking.driverDetails) {
      if (existingBooking.driverDetails.toString() !== driver._id.toString()) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized: You are not assigned to this booking",
          },
          { status: 403 },
        );
      }
    }

    // Security check: If customer is updating, ensure it's their own booking
    if (user && existingBooking.customerDetails) {
      if (existingBooking.customerDetails.toString() !== user._id.toString()) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized: This is not your booking",
          },
          { status: 403 },
        );
      }
    }

    // Filter and validate update data
    const filteredUpdateData: any = {};
    const errors: string[] = [];

    Object.keys(updateData).forEach((key) => {
      // Check if field is restricted
      if (RESTRICTED_FIELDS.includes(key)) {
        errors.push(`Field "${key}" is not allowed to be updated by customer`);
        return;
      }

      // Only include allowed fields
      if (ALLOWED_FIELDS.includes(key)) {
        // Special validation for certain fields
        if (
          key === "tripType" &&
          !["one-way", "round-trip", "local", "outstation"].includes(
            updateData[key],
          )
        ) {
          errors.push(`Invalid value for tripType`);
          return;
        }

        if (
          key === "paymentMethod" &&
          !["cash", "online", "upi", "card", "wallet"].includes(updateData[key])
        ) {
          errors.push(`Invalid value for paymentMethod`);
          return;
        }

        if (key === "cancelReason") {
          // Only allow cancelReason if status is being cancelled
          if (updateData.status !== "cancelled") {
            errors.push(
              "cancelReason can only be provided when cancelling booking",
            );
            return;
          }
        }

        filteredUpdateData[key] = updateData[key];
      }
    });

    // Handle OTP verification separately if provided
    if (updateData.otp) {
      if (!existingBooking.otp) {
        errors.push("No OTP available for this booking");
      } else if (updateData.otp !== existingBooking.otp) {
        errors.push("Invalid OTP provided");
      } else {
        // OTP is valid
        filteredUpdateData.otp_verified = true;
        filteredUpdateData.otp_verified_at = new Date();

        // Handle specific status transitions that require OTP
        if (
          updateData.status === "arrived" &&
          (existingBooking.status === "accepted" ||
            existingBooking.status === "assigned")
        ) {
          filteredUpdateData.status = "arrived";
          filteredUpdateData.arrivedAt = new Date();
        }
      }
    }

    // Handle overtime driver charge calculation on arrival
    if (filteredUpdateData.status === "arrived" || filteredUpdateData.arrivedAt || filteredUpdateData.otp_verified_at) {
      const checkTime =
        filteredUpdateData.arrivedAt || filteredUpdateData.otp_verified_at || new Date();
      if (
        existingBooking.schedule_date &&
        existingBooking.schedule_time &&
        existingBooking.package_type
      ) {
        const scheduleDateTime = parseScheduleDateTime(
          existingBooking.schedule_date,
          existingBooking.schedule_time,
        );

        if (scheduleDateTime && dayjs(checkTime).isAfter(scheduleDateTime)) {
          const delayInMinutes = dayjs(checkTime).diff(scheduleDateTime, "minute");
          if (delayInMinutes > 0) {
            const pkg = await mongoose.model("Package").findById(existingBooking.package_type);
            if (pkg && pkg.over_time_driver_charge) {
              const overtimeCharge = delayInMinutes * pkg.over_time_driver_charge;
              filteredUpdateData["fare_details.over_time_driver_charge"] = overtimeCharge;
              if (existingBooking.fare_details) {
                filteredUpdateData["fare_details.driver_charge"] =
                  (existingBooking.fare_details.driver_charge || 0) - overtimeCharge;
              }
            }
          }
        }
      }
    }

    // Handle status updates specifically
    if (updateData.status) {
      // Customers can only cancel pending or assigned bookings
      if (updateData.status === "cancelled") {
        if (!["pending", "assigned"].includes(existingBooking.status)) {
          errors.push(
            'Booking can only be cancelled when in "pending" or "assigned" status',
          );
        } else {
          filteredUpdateData.status = "cancelled";
          filteredUpdateData.cancelledAt = new Date();
        }
      } else if (driver) {
        // Driver allowed status transitions
        if (updateData.status === "completed") {
          if (existingBooking.status !== "started") {
            errors.push("Booking can only be completed after it has started");
          } else {
            filteredUpdateData.status = "completed";
            const completedAt = new Date();
            filteredUpdateData.completedAt = completedAt;

            // Auto-calculate charges for completed bookings
            try {
              const pkg = await mongoose.model("Package").findById(existingBooking.package_type);
              if (pkg) {
                // Recover original driver_charge by adding back the arrival-time deduction
                const originalDriverCharge =
                  (existingBooking.fare_details?.driver_charge || 0) +
                  (existingBooking.fare_details?.over_time_driver_charge || 0);

                // Strip surcharges already included in the creation fare to avoid double-counting.
                // The creation fare includes: fooding_charge, early_morning_charge, late_night_charge.
                // calculateBookingCharges will recalculate these from source data, so we must
                // subtract the creation-time values from baseFare first.
                const baseFareWithoutSurcharges =
                  (existingBooking.fare || 0) -
                  (existingBooking.fare_details?.fooding_charge || 0) -
                  (existingBooking.fare_details?.early_morning_charge || 0) -
                  (existingBooking.fare_details?.late_night_charge || 0) -
                  (existingBooking.fare_details?.over_time_customer_charge || 0);

                const result = calculateBookingCharges({
                  completedAt,
                  arrivedAt: existingBooking.arrivedAt,
                  startedAt: existingBooking.startedAt,
                  scheduleDate: existingBooking.schedule_date,
                  scheduleTime: existingBooking.schedule_time,
                  baseFare: baseFareWithoutSurcharges,
                  baseDriverCharge: originalDriverCharge,
                  packageConfig: {
                    over_time_customer_charge: pkg.over_time_customer_charge,
                    over_time_driver_charge: pkg.over_time_driver_charge,
                    early_morning_charge: pkg.early_morning_charge,
                    late_night_charge: pkg.late_night_charge,
                    fooding_charge: pkg.fooding_charge,
                    duration: pkg.duration,
                  },
                });

                filteredUpdateData["fare_details.over_time_customer_charge"] = result.overTimeCustomerCharge;
                filteredUpdateData["fare_details.over_time_driver_charge"] = result.overTimeDriverCharge;
                filteredUpdateData["fare_details.early_morning_charge"] = result.earlyMorningCharge;
                filteredUpdateData["fare_details.late_night_charge"] = result.lateNightCharge;
                filteredUpdateData["fare_details.fooding_charge"] = result.foodingCharge;
                filteredUpdateData["fare_details.driver_charge"] = result.driverCharge;
                filteredUpdateData.fare = result.fare;
              }
            } catch (err) {
              console.error("Calculation error in route.put:", err);
            }
          }
        } else if (updateData.status === "accepted") {
          if (existingBooking.status !== "assigned") {
            errors.push(
              'Booking can only be accepted when it is in "assigned" status',
            );
          } else {
            filteredUpdateData.status = "accepted";
            filteredUpdateData.acceptedAt = new Date();
          }
        } else if (updateData.status === "arrived") {
          // "arrived" requires OTP verification (handled by OTP block above)
          if (!updateData.otp) {
            errors.push(
              'OTP is required to change status to "arrived"',
            );
          }
        } else if (updateData.status === "started") {
          // "started" does NOT require OTP, only needs "arrived" status
          if (existingBooking.status !== "arrived") {
            errors.push(
              'Booking can only be started after driver has arrived',
            );
          } else {
            filteredUpdateData.status = "started";
            filteredUpdateData.startedAt = new Date();
          }
        } else if (updateData.status !== existingBooking.status) {
          errors.push(`Invalid status update to "${updateData.status}"`);
        }
      } else if (updateData.status !== existingBooking.status) {
        errors.push(`Customers cannot change status to "${updateData.status}"`);
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      existingBooking._id,
      { $set: filteredUpdateData },
      { new: true, runValidators: true },
    )
      .populate("customerDetails", "name email phone")
      .populate("driverDetails")
      .populate("package_type", "name description price");

    // Update driver aggregate rating if a rating was provided
    if (filteredUpdateData.driverRating && updatedBooking?.driverDetails?._id) {
      const driverId = updatedBooking.driverDetails._id;
      const newRatingValue = Number(filteredUpdateData.driverRating);
      const oldRatingValue = Number(existingBooking.driverRating || 0);
      const isNewRating = !existingBooking.driverRating;

      await Driver.findByIdAndUpdate(driverId, [
        {
          $set: {
            total_rating_sum: {
              $add: ["$total_rating_sum", newRatingValue - oldRatingValue],
            },
            total_ratings: {
              $add: ["$total_ratings", isNewRating ? 1 : 0],
            },
          },
        },
        {
          $set: {
            rating: {
              $cond: {
                if: { $gt: ["$total_ratings", 0] },
                then: { $divide: ["$total_rating_sum", "$total_ratings"] },
                else: 0,
              },
            },
          },
        },
      ]);
    }

    // If booking was completed, update driver earnings and clear active alerts
    if (
      updatedBooking?.status === "completed" &&
      existingBooking.status !== "completed"
    ) {
      if (updatedBooking.driverDetails?._id) {
        const driverUpdate: any = {
          $set: { activeAlerts: null, currentBooking: null },
          $inc: { total_rides: 1 },
        };
        if (updatedBooking.fare_details?.driver_charge) {
          driverUpdate.$inc.total_earnings = updatedBooking.fare_details.driver_charge;
        }
        await Driver.findByIdAndUpdate(updatedBooking.driverDetails._id, driverUpdate);
      }

      // Update customer total_spent
      if (updatedBooking.customerDetails?._id) {
        const customer = await Customer.findById(updatedBooking.customerDetails._id);
        if (customer) {
          const currentSpent = parseFloat(customer.total_spent || "0");
          const totalFare = updatedBooking.fare || 0;
          const newSpent = currentSpent + totalFare;
          customer.total_spent = newSpent.toString();
          await customer.save();
        }
      }
    }

    // If booking was cancelled, send notification and stop alerts
    if (filteredUpdateData.status === "cancelled") {
      // 1. Cancel the alert process and notify drivers
      try {
        const { alertService } = await import("@/services/alertService");
        await alertService.cancelAlertByBookingId(bookingId);
        console.log(`Alert cancelled for booking: ${bookingId}`);
      } catch (err) {
        console.error("Failed to cancel alert in route handler:", err);
      }

      // 2. Process refund if payment was made
      if (updatedBooking?.paymentStatus === "paid") {
        console.log(`Initiate refund for booking: ${bookingId}`);
        // Add actual refund logic here if needed
      }

      // 3. Send additional notification to driver if assigned
      if (updatedBooking?.driverDetails) {
        // (Previously it was just logging, now it's handled by alertService.cancelAlertByBookingId 
        // which calls notifyDriversOfCancellation, but we can do extra logic here if needed)
      }
    }

    // If pickup/drop locations changed, we might need to recalculate fare
    if (filteredUpdateData.pickupLat || filteredUpdateData.dropLat) {
      // Here you would recalculate fare based on new locations
      // This is a placeholder - implement your fare calculation logic
      console.log("Location changed, fare may need recalculation");
    }

    // Emit real-time event
    if (updatedBooking) {
      const payload = {
        type: SOCKET_EVENTS.BOOKING_UPDATED,
        bookingId: (updatedBooking._id as any).toString(),
        booking: updatedBooking, // FULL BOOKING
        status: updatedBooking.status,
        driverDetails: (updatedBooking as any).driverDetails,
        otp: (updatedBooking as any).otp,
      };

      socketService.emit(SOCKET_EVENTS.BOOKING_UPDATED, payload, "admin");
      socketService.emit(SOCKET_EVENTS.BOOKING_UPDATED, payload, `ride:${(updatedBooking._id as any).toString()}`);
    }

    // Send customer notification for status changes (non-blocking)
    if (updateData.status) {
      const notif = getNotificationForStatus(updateData.status);
      if (notif && existingBooking.customerDetails) {
        const customerId = existingBooking.customerDetails._id || existingBooking.customerDetails;
        sendCustomerNotification({
          customerId: String(customerId),
          title: notif.title,
          body: notif.body,
          data: {
            bookingId: String(existingBooking._id),
            status: updateData.status,
            type: "booking_status_update",
          },
        }).catch((err) => console.error("Failed to send customer notification:", err));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);

    // Handle specific Mongoose errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: errors },
        { status: 400 },
      );
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID format" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
