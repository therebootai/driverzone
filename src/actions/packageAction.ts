"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Packages from "@/models/Packages";
import { generateCustomId } from "@/utils/generateCustomId";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

await ensureModelsRegistered();

export async function ADD_PACKAGE({
  name,
  duration,
  package_type = "in_city",
  company_charge,
  driver_charge,
  fooding_charge,
  over_time_customer_charge,
  over_time_driver_charge,
  early_morning_charge,
  late_night_charge,
  service_booking_charge,
  total_price,
  destination,
  discount_type = "none",
  discount,
  main_zone,
  service_zone,
}: {
  name: string;
  duration: number;
  package_type:
    | "in_city"
    | "mini_outstation"
    | "outstation"
    | "hills_tour"
    | "long_tour"
    | "drop_pickup_service";
  company_charge: number;
  driver_charge: number;
  fooding_charge?: number;
  over_time_customer_charge: number;
  over_time_driver_charge: number;
  early_morning_charge?: number;
  late_night_charge?: number;
  service_booking_charge?: number;
  total_price: number;
  destination?: string;
  discount_type: "percentage" | "fixed" | "none";
  discount?: number;
  main_zone?: string;
  service_zone?: string;
}) {
  try {
    if (discount_type !== "none" && (!discount || discount <= 0)) {
      throw new Error("Discount value is required when discount type is not 'none'");
    }

    await connectToDatabase();
    const package_id = await generateCustomId(
      Packages,
      "package_id",
      "packageId",
    );

    const newPackage = new Packages({
      package_id,
      name,
      duration,
      package_type,
      company_charge,
      driver_charge,
      fooding_charge,
      over_time_customer_charge,
      over_time_driver_charge,
      early_morning_charge,
      late_night_charge,
      service_booking_charge,
      total_price,
      destination,
      discount_type,
      discount,
      main_zone,
      service_zone,
    });

    const savedPackage = await newPackage.save();

    revalidatePath("/admin/package-management");

    return { success: true, data: JSON.parse(JSON.stringify(savedPackage)) };
  } catch (error: any) {
    console.log(error);
    return { success: false, error: error.message, data: null };
  }
}

export async function GET_ALL_PACKAGES({
  page = 1,
  limit = 20,
  search,
  status,
  min_price,
  max_price,
  package_type,
  discount_type,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  min_price?: number;
  max_price?: number;
  package_type?:
    | "in_city"
    | "mini_outstation"
    | "outstation"
    | "hills_tour"
    | "long_tour"
    | "drop_pickup_service";
  discount_type?: "percentage" | "fixed" | "none";
}) {
  try {
    await connectToDatabase();

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof status === "boolean") {
      query.status = status;
    }

    if (package_type) {
      query.package_type = package_type;
    }

    if (min_price) {
      query.$or = [
        ...query.$or,
        { company_charge: { $gte: min_price } },
        { driver_charge: { $gte: min_price } },
        { fooding_charge: { $gte: min_price } },
        { over_time_customer_charge: { $gte: min_price } },
        { over_time_driver_charge: { $gte: min_price } },
        { early_morning_charge: { $gte: min_price } },
        { late_night_charge: { $gte: min_price } },
        { total_price: { $gte: min_price } },
      ];
    }

    if (max_price) {
      query.$or = [
        ...query.$or,
        { company_charge: { $lte: max_price } },
        { driver_charge: { $lte: max_price } },
        { fooding_charge: { $lte: max_price } },
        { over_time_customer_charge: { $lte: max_price } },
        { over_time_driver_charge: { $lte: max_price } },
        { early_morning_charge: { $lte: max_price } },
        { late_night_charge: { $lte: max_price } },
        { total_price: { $lte: max_price } },
      ];
    }

    if (discount_type) {
      query.discount_type = discount_type;
    }

    const packages = await Packages.find(query)
      .populate("main_zone")
      .populate("service_zone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Packages.countDocuments(query);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(packages)),
      paginations: {
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  } catch (error: any) {
    console.error("Error creating zone:", error);
    return {
      success: false,
      message: error.message,
      data: null,
      paginations: { totalPages: 1, currentPage: 1 },
    };
  }
}

export async function DELETE_PACKAGE(package_id: string) {
  try {
    await connectToDatabase();
    await Packages.deleteOne({
      $or: [
        { package_id },
        {
          _id: mongoose.Types.ObjectId.isValid(package_id)
            ? package_id
            : undefined,
        },
      ],
    });
    revalidatePath("/admin/package-management");
    return { success: true };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function UPDATE_PACKAGE(package_id: string, data: any) {
  try {
    if (data.discount_type && data.discount_type !== "none" && (!data.discount || data.discount <= 0)) {
      throw new Error("Discount value is required when discount type is not 'none'");
    }
    await connectToDatabase();
    const updatedPackage = await Packages.updateOne(
      {
        $or: [
          { package_id },
          {
            _id: mongoose.Types.ObjectId.isValid(package_id)
              ? package_id
              : undefined,
          },
        ],
      },
      { $set: data },
    );
    revalidatePath("/admin/package-management");
    return { success: true, data: updatedPackage };
  } catch (error: any) {
    console.log(error);
    return { success: false, error: error.message, data: null };
  }
}
