import connectToDatabase from "@/db/connection";
import Booking from "@/models/Booking";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const RESTRICTED_FIELDS = [
  "booking_id",
  "driverDetails",
  "assignedAt",
  "acceptedAt",
  "arrivedAt",
  "startedAt",
  "completedAt",
  "cancelledAt",
  "assignedAt",
  "driverRating",
  "otp_verified",
  "otp_verified_at",
];

// Fields that customers ARE allowed to update
const ALLOWED_FIELDS = [
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
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const requestedBooking = await Booking.findOne({
      $or: [{ _id: isValidObjectId(id) ? id : undefined }, { booking_id: id }],
    });

    if (!requestedBooking) {
      return NextResponse.json(
        { message: "Booking not found", success: false },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { booking: requestedBooking, success: true },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the booking ID from params
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required" },
        { status: 400 }
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
        { status: 404 }
      );
    }

    // Check if booking can be updated (not in certain statuses)
    const NON_UPDATABLE_STATUSES = [
      "cancelled",
      "completed",
      "started",
      "arrived",
      "accepted",
    ];
    if (NON_UPDATABLE_STATUSES.includes(existingBooking.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Booking cannot be updated in "${existingBooking.status}" status`,
        },
        { status: 400 }
      );
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
            updateData[key]
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
              "cancelReason can only be provided when cancelling booking"
            );
            return;
          }
        }

        filteredUpdateData[key] = updateData[key];
      }
    });

    // Handle status updates specifically
    if (updateData.status) {
      // Customers can only cancel pending or assigned bookings
      if (updateData.status === "cancelled") {
        if (!["pending", "assigned"].includes(existingBooking.status)) {
          errors.push(
            'Booking can only be cancelled when in "pending" or "assigned" status'
          );
        } else {
          filteredUpdateData.status = "cancelled";
          filteredUpdateData.cancelledAt = new Date();
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
      bookingId,
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    )
      .populate("customerDetails", "name email phone")
      .populate("driverDetails", "name vehicleNumber phone")
      .populate("package_type", "name description price");

    // If booking was cancelled, send notification
    if (filteredUpdateData.status === "cancelled") {
      // Here you would typically:
      // 1. Send cancellation notification to driver if assigned
      // 2. Process refund if payment was made
      // 3. Update driver's availability

      // Example notification logic (you'd implement your actual notification service)
      if (updatedBooking?.driverDetails) {
        console.log(
          `Send cancellation notification to driver: ${updatedBooking.driverDetails._id}`
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
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
