import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Booking from "@/models/Booking";
import Driver from "@/models/Drivers";
import Customer from "@/models/Customers";
import { verifyCustomerToken, verifyDriverToken } from "@/utils/jwt";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import mongoose from "mongoose";

dayjs.extend(customParseFormat);

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
      .populate("package_type")
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
          !["cash", "upi", "card", "wallet"].includes(updateData[key])
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
          existingBooking.status === "accepted"
        ) {
          filteredUpdateData.status = "arrived";
          filteredUpdateData.arrivedAt = new Date();
        } else if (
          updateData.status === "started" &&
          (existingBooking.status === "arrived" ||
            existingBooking.status === "accepted")
        ) {
          filteredUpdateData.status = "started";
          filteredUpdateData.startedAt = new Date();
        }
      }
    }

    // Handle overtime driver charge calculation
    if (filteredUpdateData.arrivedAt || filteredUpdateData.otp_verified_at) {
      const checkTime =
        filteredUpdateData.arrivedAt || filteredUpdateData.otp_verified_at;
      if (
        existingBooking.schedule_date &&
        existingBooking.schedule_time &&
        existingBooking.package_type
      ) {
        const scheduleDate = dayjs(existingBooking.schedule_date).format(
          "YYYY-MM-DD",
        );
        const scheduleDateTime = dayjs(
          `${scheduleDate} ${existingBooking.schedule_time}`,
          "YYYY-MM-DD hh:mm A",
        );

        if (dayjs(checkTime).isAfter(scheduleDateTime)) {
          const delayInMinutes = dayjs(checkTime).diff(
            scheduleDateTime,
            "minute",
          );
          if (delayInMinutes > 0) {
            const pkg = await mongoose
              .model("Package")
              .findById(existingBooking.package_type);
            if (pkg && pkg.over_time_driver_charge) {
              const overtimeCharge =
                delayInMinutes * pkg.over_time_driver_charge;
              filteredUpdateData["fare_details.over_time_driver_charge"] =
                overtimeCharge;
              filteredUpdateData.fare =
                (existingBooking.fare || 0) + overtimeCharge;
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
            filteredUpdateData.completedAt = new Date();
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
        } else if (["arrived", "started"].includes(updateData.status)) {
          // These are handled by OTP check above.
          // If we reach here and it wasn't handled (e.g. no OTP was provided), throw error.
          if (!updateData.otp) {
            errors.push(
              `OTP is required to change status to "${updateData.status}"`,
            );
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
      if (
        updatedBooking.driverDetails?._id &&
        updatedBooking.fare_details?.driver_charge
      ) {
        const overtimeCharge = updatedBooking.fare_details.over_time_driver_charge || 0;
        await Driver.findByIdAndUpdate(updatedBooking.driverDetails._id, {
          $inc: { 
            total_earnings: updatedBooking.fare_details.driver_charge - overtimeCharge 
          },
          $set: { activeAlerts: null, currentBooking: null },
        });
      }

      // Update customer total_spent
      if (updatedBooking.customerDetails?._id) {
        const customer = await Customer.findById(updatedBooking.customerDetails._id);
        if (customer) {
          const currentSpent = parseFloat(customer.total_spent || "0");
          let totalFare = updatedBooking.fare || 0;
          if (updatedBooking.fare_details) {
            totalFare += updatedBooking.fare_details.over_time_customer_charge || 0;
            totalFare += updatedBooking.fare_details.early_morning_charge || 0;
            totalFare += updatedBooking.fare_details.late_night_charge || 0;
          }
          const newSpent = currentSpent + totalFare;
          customer.total_spent = newSpent.toString();
          await customer.save();
        }
      }
    }

    // If booking was cancelled, send notification
    if (filteredUpdateData.status === "cancelled") {
      // Here you would typically:
      // 1. Send cancellation notification to driver if assigned
      // 2. Process refund if payment was made
      // 3. Update driver's availability

      // Example notification logic (you'd implement your actual notification service)
      if (updatedBooking?.driverDetails) {
        console.log(
          `Send cancellation notification to driver: ${updatedBooking.driverDetails._id}`,
        );
      }

      // If payment was made, initiate refund
      if (updatedBooking?.paymentStatus === "paid") {
        console.log(`Initiate refund for booking: ${bookingId}`);
      }
    }

    // If pickup/drop locations changed, we might need to recalculate fare
    if (filteredUpdateData.pickupLat || filteredUpdateData.dropLat) {
      // Here you would recalculate fare based on new locations
      // This is a placeholder - implement your fare calculation logic
      console.log("Location changed, fare may need recalculation");

      // You might want to:
      // 1. Call a fare calculation service
      // 2. Update the fare field
      // 3. Re-estimate with new distance/duration
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
