"use server"
import connectToDataBase from "@/db/connection";
import Booking, { BookingDocument } from "@/models/Booking";
import { BookingTypes, GetBookingsParams } from "@/types/types";
import { generateCustomId } from "@/utils/generateCustomId";
import { isValidObjectId, Types } from "mongoose";



export async function createBooking(
  data: BookingTypes
): Promise<BookingDocument> {
  await connectToDataBase();

  try {
    if (!data.booking_id) {
      data.booking_id = await generateCustomId(Booking, "booking_id", "bkid");
    }

    const newBooking = await Booking.create({
      booking_id: data.booking_id,

      fare: data.fare,
      estimatedFare: data.estimatedFare,

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
    });

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
    await connectToDataBase();

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
        $unwind: {
          path: "$driverDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (searchTerm && searchTerm.trim() !== "") {
      const term = escapeRegex(searchTerm.trim());

      pipeline.push({
        $match: {
          $or: [
            { pickupAddress: { $regex: term, $options: "i" } },
            { dropAddress: { $regex: term, $options: "i" } },
            { booking_id: { $regex: term, $options: "i" } },
            { "customerDetails.name": { $regex: term, $options: "i" } },
            { "customerDetails.mobile_number": { $regex: term, $options: "i" } },
            { "driverDetails.name": { $regex: term, $options: "i" } },
            { "driverDetails.mobile_number": { $regex: term, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (_page - 1) * _limit });
    pipeline.push({ $limit: _limit });
    const [bookings, totalCountArr] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.aggregate([
        { $match: match },
        {
          $count: "total",
        },
      ]),
    ]);

    const total = totalCountArr[0]?.total || 0;

     const serializedBooking = JSON.parse(JSON.stringify(bookings));

    return {
      success: true,
      data: serializedBooking,
      paginations: {
        totalPages: Math.ceil(total / _limit),
        currentPage: _page,
        totalItems: total,
        perPage: _limit,
      },
    };
  } catch (error: any) {
    console.error("GET BOOKING ERROR:", error);
    return {
      success: false,
      error: error?.message || "Unknown error",
      data: [],
      paginations: { totalPages: 0, currentPage: 1, totalItems: 0, perPage: 20 },
    };
  }
}