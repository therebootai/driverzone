import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/actions/bookingAction";
import connectToDataBase, { ensureModelsRegistered } from "@/db/connection";
import { verifyCustomerToken } from "@/utils/jwt";
import Booking from "@/models/Booking";
import { VERIFY_PAYMENT } from "@/actions/razorpayAction";
import Customer from "@/models/Customers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // If customerDetails is not provided in the body, try to get it from the auth token
    if (!body.customerDetails) {
      const token = req.headers.get("authorization");
      if (!token) {
        return NextResponse.json(
          {
            message:
              "customerDetails is required or user must be authenticated",
            success: false,
          },
          { status: 400 }
        );
      }

      await connectToDataBase();
      await ensureModelsRegistered();
      const user = await verifyCustomerToken(token.split("Bearer ")[1]);

      if (!user) {
        return NextResponse.json(
          { message: "Unauthorized", success: false },
          { status: 401 }
        );
      }

      // Set customerDetails from the authenticated user
      body.customerDetails = user._id;
    }

    const required = [
      "pickupAddress",
      "pickupLat",
      "pickupLng",
      "dropAddress",
      "dropLat",
      "dropLng",
      "razorpay_order_id",
      "razorpay_payment_id",
      "razorpay_signature",
      "customerDetails", // Still required but now we might have populated it above
      "vehicleType",
      "package_type",
      "schedule_date",
      "schedule_time",
    ];

    for (const field of required) {
      if (!body[field]) {
        console.log(field);
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const razorPayDetails = await VERIFY_PAYMENT({
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_signature: body.razorpay_signature,
    });

    if (razorPayDetails.success) {
      body.paid_amount = (razorPayDetails.payment?.amount as number) / 100;
      body.paymentStatus = "paid";
      body.paymentMethod = razorPayDetails.payment?.method as string;
    }

    const newBooking = await createBooking(body);

    if (body.coupon) {
      await Customer.findOneAndUpdate(
        {
          _id: body.customerDetails,
        },
        {
          $push: {
            used_coupons: body.coupon,
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE BOOKING API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create booking",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    let user;
    await connectToDataBase();
    await ensureModelsRegistered();
    if (token) {
      user = await verifyCustomerToken(token.split("Bearer ")[1]);
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const tripType = searchParams.get("tripType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query: any = {};

    if (user) {
      query.customerDetails = user._id;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add trip type filter if provided
    if (tripType) {
      query.tripType = tripType;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch bookings with population and sorting
    const bookings = await Booking.find(query)
      .populate("customerDetails")
      .populate("driverDetails")
      .populate("package_type")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript object

    // Get total count for pagination metadata
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Bookings fetched successfully",
    });
  } catch (error: any) {
    console.error("GET BOOKING API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
