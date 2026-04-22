"use server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Booking, { BookingDocument } from "@/models/Booking";
import Driver from "@/models/Drivers";
import Customer from "@/models/Customers";
import Package from "@/models/Packages";
import { GetBookingsParams } from "@/types/types";
import { isPointInPolygon } from "@/utils/geospatialUtils";
import { generateCustomId } from "@/utils/generateCustomId";
import { isValidObjectId, Types } from "mongoose";
import { createOTP, resendOTP, verifyOTP } from "./OTPActions";
import OTP from "@/models/OTP";
import { SEND_BY_WHATSAPP } from "./waActions";
import { sendPushNotification } from "./notificationAction";
import Notification from "@/models/Notification";

import { socketService, EVENTS as SOCKET_EVENTS } from "@/lib/socket";
import { calculateBookingCharges } from "@/utils/fareCalculator";
import { sendCustomerNotification, getNotificationForStatus } from "@/utils/sendCustomerNotification";

await ensureModelsRegistered();

function generateBookingOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function calculateTotalFare(booking: any): number {
  if (booking.status === "completed") {
    return booking.fare || 0;
  }
  let total = booking.fare || 0;

  if (booking.fare_details) {
    total += booking.fare_details.over_time_customer_charge || 0;
    total += booking.fare_details.early_morning_charge || 0;
    total += booking.fare_details.late_night_charge || 0;
    total += booking.fare_details.fooding_charge || 0;
  }

  return total;
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    assigned: "Driver Assigned",
    accepted: "Accepted by Driver",
    arrived: "Driver Arrived",
    started: "Trip Started",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
}

export async function createBooking(data: any): Promise<BookingDocument> {
  await connectToDatabase();

  try {
    if (!data.booking_id) {
      data.booking_id = await generateCustomId(Booking, "booking_id", "bkid");
    }

    if (!data.otp) {
      data.otp = generateBookingOTP();
    }

    // Check if service_booking_charge should apply
    let serviceBookingCharge = 0;
    if (data.package_type && data.pickupLat && data.pickupLng) {
      const pkg = await Package.findById(data.package_type)
        .populate("main_zone", "coordinates")
        .populate("service_zone", "coordinates");
      if (pkg && pkg.main_zone && pkg.service_zone && pkg.service_booking_charge) {
        const pickupPoint = {
          latitude: data.pickupLat,
          longitude: data.pickupLng,
        };
        const inMainZone = isPointInPolygon(
          pickupPoint,
          pkg.main_zone.coordinates || []
        );
        const inServiceZone = isPointInPolygon(
          pickupPoint,
          pkg.service_zone.coordinates || []
        );
        if (!inMainZone && inServiceZone) {
          serviceBookingCharge = pkg.service_booking_charge;
        }
      }
    }

    const newBooking: BookingDocument = await Booking.create({
      booking_id: data.booking_id,

      fare: (data.fare || 0) + serviceBookingCharge,

      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,

      dropAddress: data.dropAddress,
      dropLat: data.dropLat,
      dropLng: data.dropLng,

      tripType: data.tripType || "one-way",
      distance: data.distance,
      duration: data.duration,

      customerDetails: new Types.ObjectId(data.customerDetails),
      driverDetails: data.driverDetails
        ? new Types.ObjectId(data.driverDetails)
        : null,

      vehicleType: data.vehicleType,

      otp: data.otp,

      paymentMethod: data.paymentMethod || "cash",
      paymentStatus: data.paymentStatus || "pending",

      status: data.status || "pending",

      cancelReason: data.cancelReason,
      driverRating: data.driverRating,
      customerRating: data.customerRating,

      package_type: data.package_type
        ? new Types.ObjectId(data.package_type)
        : null,

      schedule_date: data.schedule_date,
      schedule_time: data.schedule_time,

      fare_details: {
        company_charge: data.company_charge,
        driver_charge: data.driver_charge,
        fooding_charge: data.fooding_charge,
        over_time_customer_charge: 0,
        over_time_driver_charge: 0,
        early_morning_charge: data.early_morning_charge,
        late_night_charge: data.late_night_charge,
        service_booking_charge: serviceBookingCharge,
      },

      insurance: data.insurance,

      coupon: isValidObjectId(data.coupon) ? data.coupon : null,
    });

    // Create OTP record in OTP model for the customer
    const customer = await Customer.findById(data.customerDetails);
    if (customer && customer.mobile_number) {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 99); // "No expiry"

      await OTP.create({
        phone: customer.mobile_number,
        otp: newBooking.otp,
        type: "booking-arrival",
        expiresAt: farFuture,
      });
    }

    // Automatically trigger Alert system for driver matching
    try {
      const { PriorityAlertService } = await import("@/services/alertService");
      const alertService = PriorityAlertService.getInstance();
      // Use the string booking_id which is explicitly typed in BookingDocument
      await alertService.initializeAlert(newBooking.booking_id);
    } catch (alertError) {
      console.error("Failed to initialize alerts automatically:", alertError);
      // We don't throw here to avoid failing the booking creation if just the alert trigger fails
    }

    // Emit event for real-time updates via Socket.io
    socketService.emit(SOCKET_EVENTS.BOOKING_CREATED, {
      bookingId: (newBooking._id as any).toString(),
      booking: newBooking,
      type: SOCKET_EVENTS.BOOKING_CREATED,
    }, "admin");

    return newBooking;
  } catch (error: any) {
    console.error("CREATE BOOKING ERROR:", error);
    throw new Error(error.message || "Failed to create booking");
  }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getBookings({
  page = 1,
  limit = 20,
  searchTerm,
  status,
  booking_id,
  customerId,
  driverId,
  paymentStatus,
  tripType,
  startDate,
  endDate,
}: GetBookingsParams) {
  try {
    await connectToDatabase();

    const _page = Math.max(1, Number(page) || 1);
    const _limit = Math.max(1, Math.min(100, Number(limit) || 20));

    const match: any = {};

    if (booking_id) match.booking_id = booking_id;
    if (status) match.status = status;
    if (paymentStatus) match.paymentStatus = paymentStatus;
    if (tripType) match.tripType = tripType;

    if (customerId && isValidObjectId(customerId)) {
      match.customerDetails = new Types.ObjectId(customerId);
    }

    if (driverId && isValidObjectId(driverId)) {
      match.driverDetails = new Types.ObjectId(driverId);
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const pipeline: any[] = [
      { $match: match },
      // Populate customerDetails
      {
        $lookup: {
          from: "customers",
          localField: "customerDetails",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      // Populate driverDetails
      {
        $lookup: {
          from: "drivers",
          localField: "driverDetails",
          foreignField: "_id",
          as: "driverDetails",
        },
      },
      {
        $unwind: {
          path: "$driverDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Populate package_type
      {
        $lookup: {
          from: "packages",
          localField: "package_type",
          foreignField: "_id",
          as: "package_type",
        },
      },
      {
        $unwind: {
          path: "$package_type",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Populate vehicleType if it's a reference (assuming Vehicle model exists)
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleType",
          foreignField: "_id",
          as: "vehicleTypeInfo",
        },
      },
      {
        $unwind: {
          path: "$vehicleTypeInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add calculated fields for better data representation
      {
        $addFields: {
          // Format dates for frontend
          formattedCreatedAt: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          formattedUpdatedAt: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S",
              date: "$updatedAt",
              timezone: "UTC",
            },
          },
          formattedScheduleDate: {
            $cond: {
              if: { $ne: ["$schedule_date", null] },
              then: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$schedule_date",
                  timezone: "UTC",
                },
              },
              else: null,
            },
          },
          // Calculate total charges if needed
          totalCharges: {
            $cond: {
              if: { $ne: ["$fare_details", null] },
              then: {
                $add: [
                  { $ifNull: ["$fare_details.company_charge", 0] },
                  { $ifNull: ["$fare_details.driver_charge", 0] },
                  { $ifNull: ["$fare_details.fooding_charge", 0] },
                  { $ifNull: ["$fare_details.over_time_customer_charge", 0] },
                  { $ifNull: ["$fare_details.early_morning_charge", 0] },
                  { $ifNull: ["$fare_details.late_night_charge", 0] },
                  { $ifNull: ["$fare_details.service_booking_charge", 0] },
                ],
              },
              else: null,
            },
          },
          // Status tracking information
          statusInfo: {
            pending: { $eq: ["$status", "pending"] },
            active: {
              $in: ["$status", ["assigned", "accepted", "arrived", "started"]],
            },
            completed: { $eq: ["$status", "completed"] },
            cancelled: { $eq: ["$status", "cancelled"] },
          },
        },
      },
      // Project only necessary fields for cleaner response
      {
        $project: {
          booking_id: 1,
          fare: 1,
          pickupAddress: 1,
          pickupLat: 1,
          pickupLng: 1,
          dropAddress: 1,
          dropLat: 1,
          dropLng: 1,
          tripType: 1,
          distance: 1,
          duration: 1,
          vehicleType: 1,
          vehicleTypeInfo: 1,
          customerDetails: {
            _id: 1,
            name: 1,
            email: 1,
            mobile_number: 1,
            profile_picture: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          driverDetails: {
            _id: 1,
            driver_name: 1,
            mobile_number: 1,
            profile_picture: 1,
            vehicle_number: 1,
            license_number: 1,
            status: 1,
            rating: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          otp: 1,
          otp_verified: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          status: 1,
          cancelReason: 1,
          driverRating: 1,
          customerRating: 1,
          package_type: {
            _id: "$package_type._id",
            name: "$package_type.name",
            price: "$package_type.total_price",
            duration: "$package_type.duration",
            status: "$package_type.status",
            createdAt: "$package_type.createdAt",
            updatedAt: "$package_type.updatedAt",
          },
          schedule_date: 1,
          schedule_time: 1,
          formattedScheduleDate: 1,
          fare_details: 1,
          totalCharges: 1,
          insurance: 1,
          statusInfo: 1,
          createdAt: 1,
          updatedAt: 1,
          formattedCreatedAt: 1,
          formattedUpdatedAt: 1,
        },
      },
    ];

    if (searchTerm && searchTerm.trim() !== "") {
      const term = escapeRegex(searchTerm.trim());

      // Insert search stage before projections
      const searchStage = {
        $match: {
          $or: [
            { pickupAddress: { $regex: term, $options: "i" } },
            { dropAddress: { $regex: term, $options: "i" } },
            { booking_id: { $regex: term, $options: "i" } },
            { "customerDetails.name": { $regex: term, $options: "i" } },
            {
              "customerDetails.mobile_number": { $regex: term, $options: "i" },
            },
            { "customerDetails.email": { $regex: term, $options: "i" } },
            { "driverDetails.driver_name": { $regex: term, $options: "i" } },
            { "driverDetails.mobile_number": { $regex: term, $options: "i" } },
            { "driverDetails.vehicle_number": { $regex: term, $options: "i" } },
            { "package_type.name": { $regex: term, $options: "i" } },
            { "vehicleTypeInfo.name": { $regex: term, $options: "i" } },
            { "vehicleTypeInfo.model": { $regex: term, $options: "i" } },
          ],
        },
      };

      // Insert search stage after lookups but before projections
      pipeline.splice(pipeline.length - 1, 0, searchStage);
    }

    // Sorting, pagination, and final projection
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (_page - 1) * _limit });
    pipeline.push({ $limit: _limit });

    const [bookings, totalCountArr] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "customers",
            localField: "customerDetails",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        { $unwind: "$customerDetails" },
        {
          $lookup: {
            from: "drivers",
            localField: "driverDetails",
            foreignField: "_id",
            as: "driverDetails",
          },
        },
        {
          $unwind: { path: "$driverDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_type",
            foreignField: "_id",
            as: "package_type",
          },
        },
        {
          $unwind: { path: "$package_type", preserveNullAndEmptyArrays: true },
        },
        ...(searchTerm && searchTerm.trim() !== ""
          ? [
              {
                $match: {
                  $or: [
                    {
                      pickupAddress: {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                    {
                      dropAddress: {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                    {
                      booking_id: {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                    {
                      "customerDetails.name": {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                    {
                      "customerDetails.mobile_number": {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                    {
                      "driverDetails.driver_name": {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                    {
                      "driverDetails.mobile_number": {
                        $regex: escapeRegex(searchTerm.trim()),
                        $options: "i",
                      },
                    },
                  ],
                },
              },
            ]
          : []),
        { $count: "total" },
      ]),
    ]);

    const total = totalCountArr[0]?.total || 0;

    // Format the data further if needed
    const formattedBookings = bookings.map((booking: any) => {
      // Add any additional formatting here
      return {
        ...booking,
        // Add human-readable status
        statusText: getStatusText(booking.status),
        // Calculate total fare with details
        totalFare: calculateTotalFare(booking),
        // Add trip summary
        tripSummary: {
          distance: `${booking.distance || 0} km`,
          duration: booking.duration
            ? `${booking.duration} mins`
            : booking.package_type?.duration
            ? `${booking.package_type.duration} hrs`
            : "0 mins",
          type: booking.tripType,
        },
      };
    });

    const serializedBooking = JSON.parse(JSON.stringify(formattedBookings));

    return {
      success: true,
      data: serializedBooking,
      paginations: {
        totalPages: Math.ceil(total / _limit),
        currentPage: _page,
        totalItems: total,
        perPage: _limit,
        hasNextPage: _page < Math.ceil(total / _limit),
        hasPrevPage: _page > 1,
      },
      summary: {
        totalBookings: total,
        totalFare: bookings.reduce((sum, b) => sum + (b.fare || 0), 0),
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
        pending: bookings.filter((b) => b.status === "pending").length,
      },
    };
  } catch (error: any) {
    console.error("GET BOOKING ERROR:", error);
    return {
      success: false,
      error: error?.message || "Unknown error",
      data: [],
      paginations: {
        totalPages: 0,
        currentPage: 1,
        totalItems: 0,
        perPage: 20,
        hasNextPage: false,
        hasPrevPage: false,
      },
      summary: {
        totalBookings: 0,
        totalFare: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
      },
    };
  }
}

export async function updateBooking(
  bookingId: string,
  updateData: Partial<BookingDocument>,
  options: {
    validateOtp?: boolean;
    updateCustomerRating?: boolean;
    updateDriverRating?: boolean;
    forceStatusChange?: boolean;
    isAdminAssignment?: boolean;
  } = {},
) {
  try {
    await connectToDatabase();
    await ensureModelsRegistered();

    // Validate booking ID
    if (!bookingId || !isValidObjectId(bookingId)) {
      return {
        success: false,
        error: "Invalid booking ID",
        data: null,
      };
    }

    // Find the existing booking
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return {
        success: false,
        error: "Booking not found",
        data: null,
      };
    }

    // Prevent editing completed or cancelled bookings
    if (["completed", "cancelled"].includes(existingBooking.status)) {
      // Allow only ratings updates if the booking is already completed/cancelled
      const updateKeys = Object.keys(updateData);
      const isRatingUpdate = updateKeys.every((key) =>
        ["customerRating", "driverRating"].includes(key),
      );

      if (!isRatingUpdate) {
        return {
          success: false,
          error: `Cannot edit a booking that is already ${existingBooking.status}`,
          data: null,
        };
      }
    }

    // Prepare update object with validation
    const updateObject: any = {};
    const validationErrors: string[] = [];

    // Track if status is being changed
    const isChangingStatus =
      updateData.status && updateData.status !== existingBooking.status;
    const newStatus = updateData.status || existingBooking.status;

    // Check if status change is allowed
    if (isChangingStatus && !options.forceStatusChange) {
      const allowedStatusTransitions: Record<string, string[]> = {
        pending: ["assigned", "cancelled"],
        assigned: ["accepted", "cancelled"],
        accepted: ["arrived", "cancelled"],
        arrived: ["started", "cancelled"],
        started: ["completed", "cancelled"],
        completed: [], // No further transitions from completed
        cancelled: [], // No further transitions from cancelled
      };

      const currentStatus = existingBooking.status;

      if (!allowedStatusTransitions[currentStatus]?.includes(newStatus)) {
        validationErrors.push(
          `Cannot change status from ${currentStatus} to ${newStatus}. Allowed transitions: ${
            allowedStatusTransitions[currentStatus]?.join(", ") || "none"
          }`,
        );
      }

      // Special validations for specific status changes
      if (newStatus === "accepted" && !existingBooking.driverDetails) {
        validationErrors.push(
          "Cannot accept booking without a driver assigned",
        );
      }

      if (newStatus === "started" && existingBooking.status !== "arrived") {
        validationErrors.push("Cannot start trip until driver has arrived");
      }

      if (newStatus === "completed" && existingBooking.status !== "started") {
        validationErrors.push("Cannot complete trip until it has started");
      }
    }

    // Validate OTP if required
    if (options.validateOtp && updateData.otp) {
      if (!existingBooking.otp) {
        validationErrors.push("No OTP available for verification");
      } else if (updateData.otp !== existingBooking.otp) {
        validationErrors.push("Invalid OTP provided");
      } else {
        // OTP matches
        updateObject.otp_verified = true;
        updateObject.otp_verified_at = new Date();

        // If status is not provided, but we are verifying OTP,
        // it usually means we are transitioning to 'arrived' or 'started'
        // For this specific task, if OTP is verified, we should probably set status to 'arrived'
        // if it's currently 'accepted'.
        if (!updateData.status && existingBooking.status === "accepted") {
          updateObject.status = "arrived";
          updateObject.arrivedAt = new Date();
        }
      }
    }

    // Validate ratings
    if (
      options.updateCustomerRating &&
      updateData.customerRating !== undefined
    ) {
      if (updateData.customerRating < 1 || updateData.customerRating > 5) {
        validationErrors.push("Customer rating must be between 1 and 5");
      }

      if (existingBooking.customerRating) {
        validationErrors.push("Customer rating already provided");
      }
    }

    if (options.updateDriverRating && updateData.driverRating !== undefined) {
      if (updateData.driverRating < 1 || updateData.driverRating > 5) {
        validationErrors.push("Driver rating must be between 1 and 5");
      }

      if (existingBooking.driverRating) {
        validationErrors.push("Driver rating already provided");
      }
    }

    // Validate fare updates
    if (updateData.fare !== undefined) {
      if (updateData.fare < 0) {
        validationErrors.push("Fare cannot be negative");
      }

      // If fare is being reduced, check if payment is already made
      if (
        updateData.fare < existingBooking.fare &&
        existingBooking.paymentStatus === "paid"
      ) {
        validationErrors.push("Cannot reduce fare after payment is completed");
      }
    }

    // Validate payment status changes
    if (
      updateData.paymentStatus &&
      updateData.paymentStatus !== existingBooking.paymentStatus
    ) {
      if (
        !options.forceStatusChange &&
        existingBooking.paymentStatus === "paid" &&
        updateData.paymentStatus !== "paid"
      ) {
        validationErrors.push("Cannot change payment status from 'paid'");
      }

      if (
        !options.forceStatusChange &&
        updateData.paymentStatus === "paid" &&
        existingBooking.status !== "completed"
      ) {
        validationErrors.push("Cannot mark as paid until trip is completed");
      }
    }

    // Validate driver assignment
    if (updateData.driverDetails) {
      let driverIdString: string;

      // Convert to string based on type
      if (typeof updateData.driverDetails === "string") {
        driverIdString = updateData.driverDetails;
      } else if (updateData.driverDetails instanceof Types.ObjectId) {
        driverIdString = updateData.driverDetails?.toString();
      } else {
        // Handle case where it might be an ObjectId-like object
        driverIdString = String(updateData.driverDetails);
      }

      if (!isValidObjectId(driverIdString)) {
        validationErrors.push("Invalid driver ID");
      }
    }

    // Validate customer cannot be changed
    if (
      updateData.customerDetails &&
      updateData.customerDetails.toString() !==
        existingBooking.customerDetails?.toString()
    ) {
      validationErrors.push("Cannot change customer for existing booking");
    }

    // Validate dates
    if (updateData.schedule_date) {
      const scheduleDate = new Date(updateData.schedule_date as any);
      if (!options.forceStatusChange && scheduleDate < new Date()) {
        validationErrors.push("Schedule date cannot be in the past");
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: "Validation failed",
        validationErrors,
        data: null,
      };
    }

    // Build update object
    const allowedFields = [
      "fare",
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
      "driverDetails",
      "otp",
      "otp_verified",
      "paymentMethod",
      "paymentStatus",
      "status",
      "cancelReason",
      "driverRating",
      "customerRating",
      "customerTags",
      "package_type",
      "schedule_date",
      "schedule_time",
      "fare_details",
      "insurance",
    ];

    // Process each field
    for (const field of allowedFields) {
      const fieldKey = field as keyof BookingDocument;
      if (updateData[fieldKey] !== undefined) {
        const value = updateData[fieldKey];

        // Special handling for ObjectId fields
        if ((field === "driverDetails" || field === "package_type") && value) {
          if (isValidObjectId(value as string)) {
            updateObject[field] = new Types.ObjectId(value as string);
          } else if (value === null) {
            updateObject[field] = null;
          }
        }
        // Special handling for fare_details - merge with existing
        else if (field === "fare_details" && value) {
          const existingFareDetails = existingBooking.fare_details
            ? JSON.parse(JSON.stringify(existingBooking.fare_details))
            : {};
          const newFareDetails = value as any;
          updateObject["fare_details"] = {
            ...existingFareDetails,
            ...newFareDetails,
          };
        }
        // Special handling for status changes
        else if (field === "status" && isChangingStatus && newStatus) {
          updateObject[field] = value;

          // Add timestamp for status change
          const statusField = `${newStatus}At`;
          updateObject[statusField] = new Date();

          // Handle completion - auto-calculate duration
          if (newStatus === "completed" && !updateData.duration) {
            // If duration not provided in update, try to calculate it
            const completedAt = new Date();

            // Check if we have startedAt timestamp (if you store it)
            // If not, we can't calculate duration
            // You might want to add a startedAt field to your schema
            // For now, we'll skip auto-calculation
          }

          // Handle cancellation - set cancel timestamp
          if (newStatus === "cancelled") {
            updateObject.cancelledAt = new Date();

            // Auto-refund logic for paid bookings
            if (existingBooking.paymentStatus === "paid") {
              updateObject.paymentStatus = "pending";
              updateObject.refundInitiated = true;
              updateObject.refundInitiatedAt = new Date();
            }
          }
        }
        // Default handling
        else {
          updateObject[field] = value;
        }
      }
    }

    // Always update the updatedAt timestamp
    updateObject.updatedAt = new Date();

    // Auto-calculate charges for completed bookings
    if (isChangingStatus && newStatus === "completed") {
      try {
        const pkg = await Package.findById(existingBooking.package_type);
        if (pkg) {
          const completedAt = updateObject.completedAt || new Date();

          // Recover original driver_charge by adding back the arrival-time deduction
          // to avoid double-deduction (driver_charge may have been reduced at arrival)
          const originalDriverCharge =
            (existingBooking.fare_details?.driver_charge || 0) +
            (existingBooking.fare_details?.over_time_driver_charge || 0);

          const result = calculateBookingCharges({
            completedAt,
            arrivedAt: existingBooking.arrivedAt,
            scheduleDate: existingBooking.schedule_date,
            scheduleTime: existingBooking.schedule_time,
            baseFare: existingBooking.fare || 0,
            baseDriverCharge: originalDriverCharge,
            packageConfig: {
              over_time_customer_charge: pkg.over_time_customer_charge,
              over_time_driver_charge: pkg.over_time_driver_charge,
              early_morning_charge: pkg.early_morning_charge,
              late_night_charge: pkg.late_night_charge,
              fooding_charge: pkg.fooding_charge,
              duration: pkg.duration,
            },
            existingOvertimeDriverCharge:
              existingBooking.fare_details?.over_time_driver_charge || 0,
          });

          const currentFareDetails = existingBooking.fare_details || {};
          updateObject.fare_details = {
            ...JSON.parse(JSON.stringify(currentFareDetails)),
            over_time_customer_charge: result.overTimeCustomerCharge,
            over_time_driver_charge: result.overTimeDriverCharge,
            early_morning_charge: result.earlyMorningCharge,
            late_night_charge: result.lateNightCharge,
            fooding_charge: result.foodingCharge,
            driver_charge: result.driverCharge,
          };
          updateObject.fare = result.fare;
        }
      } catch (err) {
        console.error("Calculation error in updateBooking:", err);
      }
    }

    // Perform the update
    const updatedBooking = (await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updateObject },
      { new: true, runValidators: true },
    )
      .populate("customerDetails", "name email mobile_number profile_picture")
      .populate(
        "driverDetails",
        "driver_name mobile_number profile_picture vehicle_number license_number status rating",
      )
      .populate(
        "package_type",
        "name total_price duration status",
      )) as any;

    if (!updatedBooking) {
      return {
        success: false,
        error: "Failed to update booking",
        data: null,
      };
    }

    // Serialize the response
    const serializedBooking = JSON.parse(JSON.stringify(updatedBooking));

    if (serializedBooking.package_type && serializedBooking.package_type.total_price) {
      serializedBooking.package_type.price = serializedBooking.package_type.total_price;
    }

    // Notify driver if one was just assigned
    if (updateData.driverDetails) {
      try {
        const driverIdStr =
          typeof updateData.driverDetails === "string"
            ? updateData.driverDetails
            : updateData.driverDetails instanceof Types.ObjectId
              ? updateData.driverDetails.toString()
              : String(updateData.driverDetails);
        //@ts-ignore
        const driver = (await Driver.findById(driverIdStr)) as any;
        if (driver) {
          // If it's a direct assignment, we don't set activeAlerts
          // as we don't want the modal/sound to trigger Accept/Reject
          if (!options.isAdminAssignment) {
            if (
              !driver.activeAlerts ||
              driver.activeAlerts.bookingId?.toString() !==
                updatedBooking?._id?.toString()
            ) {
              driver.activeAlerts = {
                bookingId: updatedBooking._id,
                alertSentAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
                status: "accepted",
              };
            } else {
              driver.activeAlerts.status = "accepted";
            }
          }
          
          driver.markModified("activeAlerts");
          driver.currentBooking = updatedBooking._id;
          await driver.save();
        }

        if (driver && (driver as any).fcmToken) {
          const notificationData = {
            title: options.isAdminAssignment ? "New Booking Assigned (Direct)" : "You have been assigned a booking!",
            body: `Pickup: ${updatedBooking.pickupAddress} → Drop: ${updatedBooking.dropAddress}`,
            type: options.isAdminAssignment ? "direct_assignment" : "booking_assigned",
            bookingId: serializedBooking.booking_id ?? bookingId,
            pickupAddress: updatedBooking.pickupAddress ?? "",
            dropAddress: updatedBooking.dropAddress ?? "",
            fare: String(updatedBooking.fare ?? ""),
            customerName:
              (updatedBooking.customerDetails as any)?.name ?? "Customer",
            customerMobile:
              (updatedBooking.customerDetails as any)?.mobile_number ?? "",
          };

          // Create notification in DB
          await Notification.create({
            recipientId: driver._id,
            recipientType: "driver",
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData,
          });

          await sendPushNotification({
            token: (driver as any).fcmToken,
            data: notificationData as Record<string, string>,
            notification: {
              title: notificationData.title,
              body: notificationData.body,
            },
            android: { priority: options.isAdminAssignment ? "normal" : "high" },
          });

          // Emit socket event for realtime UI update
          try {
            const { socketService, EVENTS } = await import("@/lib/socket");
            socketService.emit(
              EVENTS.BOOKING_ASSIGNED,
              notificationData,
              `driver:${driver._id}`,
            );
          } catch (socketError) {
            console.error(
              "Failed to emit booking:assigned to driver:",
              socketError,
            );
          }
        }
      } catch (notifError) {
        console.error(
          "Failed to send driver assignment notification:",
          notifError,
        );
      }
    }

    // If customer rating is provided, update the customer's average rating
    if (options.updateCustomerRating && updateData.customerRating && updatedBooking.customerDetails) {
      try {
        const customerId = updatedBooking.customerDetails._id;
        const customer = await Customer.findById(customerId);
        if (customer) {
          const newRating = Number(updateData.customerRating);
          const currentAvg = customer.average_rating || 0;
          const currentCount = customer.total_ratings || 0;
          
          const newCount = currentCount + 1;
          const newAvg = ((currentAvg * currentCount) + newRating) / newCount;
          
          customer.average_rating = Number(newAvg.toFixed(2));
          customer.total_ratings = newCount;
          customer.rating = newAvg.toFixed(1); // Keep string version for UI compatibility
          
          await customer.save();
        }
      } catch (ratingError) {
        console.error("Failed to update customer rating:", ratingError);
      }
    }

    // If driver rating is provided, update the driver's total stats
    if (options.updateDriverRating && updateData.driverRating && updatedBooking.driverDetails) {
      try {
        const driverId = updatedBooking.driverDetails._id;
        const driver = await Driver.findById(driverId);
        if (driver) {
          const newRating = Number(updateData.driverRating);
          const currentSum = driver.total_rating_sum || 0;
          const currentCount = driver.total_ratings || 0;

          const newSum = currentSum + newRating;
          const newCount = currentCount + 1;
          const newAvg = newSum / newCount;

          driver.total_rating_sum = newSum;
          driver.total_ratings = newCount;
          driver.rating = Number(newAvg.toFixed(2));

          await driver.save();
        }
      } catch (driverRatingError) {
        console.error("Failed to update driver rating stats:", driverRatingError);
      }
    }

    if (
      isChangingStatus &&
      newStatus === "completed"
    ) {
      try {
        if (updatedBooking.customerDetails) {
          const customerId = 
            updatedBooking.customerDetails instanceof Types.ObjectId
              ? updatedBooking.customerDetails
              : (updatedBooking.customerDetails as any)._id;

          const customer = await Customer.findById(customerId);
          if (customer) {
            const currentSpent = parseFloat(customer.total_spent || "0");
            const totalFare = calculateTotalFare(updatedBooking);
            const newSpent = currentSpent + totalFare;
            customer.total_spent = newSpent.toString();
            await customer.save();
          }
        }
      } catch (spentError) {
        console.error("Failed to update customer total_spent:", spentError);
      }
    }

    // Remove from activeAlerts if completed or cancelled
    if (
      isChangingStatus &&
      (newStatus === "completed" || newStatus === "cancelled")
    ) {
      try {
        const driverIdToCleanup =
          updatedBooking.driverDetails instanceof Types.ObjectId
            ? updatedBooking.driverDetails
            : (updatedBooking.driverDetails as any)?._id;

        if (newStatus === "cancelled") {
          // 1. Cancel the alert process and notify drivers
          const { alertService } = await import("@/services/alertService");
          await alertService.cancelAlertByBookingId(bookingId);
        }

        if (driverIdToCleanup) {
          // If cancelled, send push notification to the driver before cleaning up currentBooking
          // Note: alertService.cancelAlertByBookingId already handles notifying assigned drivers,
          // but if the driver is already assigned to the BOOKING object, we might want extra notification
          if (newStatus === "cancelled" && !updatedBooking.driverDetails) {
            // Already handled by alertService
          }

          // Cleanup driver's active state
          const driverUpdate: any = { activeAlerts: null, currentBooking: null };
          
          // Update total_earnings and total_rides if completed
          if (newStatus === "completed") {
            const incFields: any = { total_rides: 1 };
            if (updatedBooking.fare_details?.driver_charge) {
              incFields.total_earnings = updatedBooking.fare_details.driver_charge;
            }
            driverUpdate.$inc = incFields;
          }

          await Driver.findByIdAndUpdate(driverIdToCleanup, driverUpdate);
        }
      } catch (cleanupError) {
        console.error("Failed to cleanup activeAlerts and notify driver:", cleanupError);
      }
    }

    // Send customer notification for status changes (non-blocking)
    if (isChangingStatus && newStatus && updatedBooking) {
      const notif = getNotificationForStatus(newStatus);
      if (notif) {
        const customerId = existingBooking.customerDetails?._id || existingBooking.customerDetails;
        if (customerId) {
          sendCustomerNotification({
            customerId: String(customerId),
            title: notif.title,
            body: notif.body,
            data: {
              bookingId: String(existingBooking._id),
              status: newStatus,
              type: "booking_status_update",
            },
          }).catch((err) => console.error("Failed to send customer notification:", err));
        }
      }
    }

    // Emit event for real-time updates via Socket.io
    const payload = {
      bookingId: serializedBooking._id,
      booking: serializedBooking,
      type: SOCKET_EVENTS.BOOKING_UPDATED,
    };
    
    // Sync with admin
    socketService.emit(SOCKET_EVENTS.BOOKING_UPDATED, payload, "admin");
    
    // Sync with specific ride room if available
    if (serializedBooking._id) {
      socketService.emit(SOCKET_EVENTS.BOOKING_UPDATED, payload, `ride:${serializedBooking._id}`);
    }

    return {
      success: true,
      message: "Booking updated successfully",
      data: serializedBooking,
      changes: {
        statusChanged: isChangingStatus,
        oldStatus: existingBooking.status,
        newStatus: updateData.status,
      },
    };
  } catch (error: any) {
    console.error("UPDATE BOOKING ERROR:", error);

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return {
        success: false,
        error: "Validation failed",
        validationErrors,
        data: null,
      };
    }

    if (error.code === 11000) {
      return {
        success: false,
        error: "Duplicate booking ID",
        data: null,
      };
    }

    return {
      success: false,
      error: error?.message || "Unknown error occurred",
      data: null,
    };
  }
}

export async function sendBookingArrivalOTP(bookingId: string) {
  try {
    await connectToDatabase();

    // Find booking and customer details
    const booking = await Booking.findById(bookingId).populate(
      "customerDetails",
      "mobile_number name",
    );

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if booking is in correct state for arrival
    if (booking.status !== "accepted") {
      return {
        success: false,
        error: `Cannot send arrival OTP. Booking status is ${booking.status}. Expected: accepted`,
      };
    }

    const customerPhone = booking.customerDetails?.mobile_number;
    if (!customerPhone) {
      return {
        success: false,
        error: "Customer phone number not found",
      };
    }

    // Use only createOTP function
    const otp = await createOTP(
      null,
      customerPhone,
      "booking-arrival", // Use the new type
    );

    // Store OTP in booking for reference (optional)
    await Booking.findByIdAndUpdate(bookingId, {
      otp,
      otp_verified: false,
      otp_sent_at: new Date(),
    });

    console.log(`Arrival OTP ${otp} generated for booking ${bookingId}`);

    await SEND_BY_WHATSAPP({
      mobile: customerPhone,
      message: otp,
    });

    return {
      success: true,
      message: "OTP sent to customer",
      otp, // For testing/demo purposes
      customerPhone,
      expiresIn: process.env.OTP_EXPIRY_MINUTES || "10",
    };
  } catch (error: any) {
    console.error("SEND BOOKING ARRIVAL OTP ERROR:", error);
    return {
      success: false,
      error: error?.message || "Failed to send OTP",
    };
  }
}

export async function verifyBookingArrivalOTP(bookingId: string, otp: string) {
  try {
    await connectToDatabase();

    // Find booking and customer details
    const booking = await Booking.findById(bookingId).populate(
      "customerDetails",
      "mobile_number",
    );

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    const customerPhone = booking.customerDetails?.mobile_number;
    if (!customerPhone) {
      return {
        success: false,
        error: "Customer phone number not found",
      };
    }

    // Use only verifyOTP function
    const verification = await verifyOTP(
      null,
      customerPhone,
      otp,
      "booking-arrival", // Match the type used when creating
    );

    if (!verification.success) {
      return {
        success: false,
        error: verification.message,
        attemptsLeft: verification.attemptsLeft,
      };
    }

    // Update booking with OTP verification status
    await Booking.findByIdAndUpdate(bookingId, {
      otp_verified: true,
      otp_verified_at: new Date(),
    });

    return {
      success: true,
      message: "OTP verified successfully",
      data: verification.data,
    };
  } catch (error: any) {
    console.error("VERIFY BOOKING ARRIVAL OTP ERROR:", error);
    return {
      success: false,
      error: error?.message || "Failed to verify OTP",
    };
  }
}

export async function resendBookingArrivalOTP(bookingId: string) {
  try {
    await connectToDatabase();

    const booking = await Booking.findById(bookingId).populate(
      "customerDetails",
      "mobile_number",
    );

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    const customerPhone = booking.customerDetails?.mobile_number;
    if (!customerPhone) {
      return {
        success: false,
        error: "Customer phone number not found",
      };
    }

    // Use only resendOTP function
    const resendResult = await resendOTP(
      null,
      customerPhone,
      "booking-arrival",
    );

    if (resendResult.success) {
      // Update booking with new OTP
      await Booking.findByIdAndUpdate(bookingId, {
        otp: resendResult.data,
        otp_verified: false,
        otp_sent_at: new Date(),
      });

      await SEND_BY_WHATSAPP({
        mobile: customerPhone,
        message: resendResult.data ?? "",
      });
      return {
        success: true,
        message: "OTP resent successfully",
        waitTime: resendResult.waitTime,
      };
    }

    return {
      success: false,
      error: resendResult.message,
      waitTime: resendResult.waitTime,
    };
  } catch (error: any) {
    console.error("RESEND BOOKING ARRIVAL OTP ERROR:", error);
    return {
      success: false,
      error: error?.message || "Failed to resend OTP",
    };
  }
}

// Helper function to check if OTP is already sent
export async function checkBookingOTPStatus(bookingId: string) {
  try {
    await connectToDatabase();

    const booking = await Booking.findById(bookingId).populate(
      "customerDetails",
      "mobile_number name",
    );

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    const customerPhone = booking.customerDetails?.mobile_number;
    if (!customerPhone) {
      return {
        success: false,
        error: "Customer phone number not found",
      };
    }

    // Check in OTP collection using the same criteria
    const existingOtp = await OTP.findOne({
      phone: customerPhone,
      type: "booking-arrival",
      verified: false,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 3 },
    });

    return {
      success: true,
      hasActiveOTP: !!existingOtp,
      otpSentAt: booking.otp_sent_at,
      otpVerified: booking.otp_verified,
      customerPhone,
      customerName: booking.customerDetails?.name,
    };
  } catch (error: any) {
    console.error("CHECK BOOKING OTP STATUS ERROR:", error);
    return {
      success: false,
      error: error?.message || "Failed to check OTP status",
    };
  }
}
