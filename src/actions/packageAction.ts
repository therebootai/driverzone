"use server";

import connectToDataBase from "@/db/connection";
import Packages from "@/models/Packages";
import { generateCustomId } from "@/utils/generateCustomId";
import { revalidatePath } from "next/cache";

export async function ADD_PACKAGE({
  name,
  duration,
  company_charge,
  driver_charge,
  fooding_charge,
  over_time_customer_charge,
  over_time_driver_charge,
  early_morning_charge,
  late_night_charge,
  total_price,
  destination,
  main_zone,
  service_zone,
}: {
  name: string;
  duration: number;
  company_charge: number;
  driver_charge: number;
  fooding_charge: number;
  over_time_customer_charge: number;
  over_time_driver_charge: number;
  early_morning_charge?: number;
  late_night_charge?: number;
  total_price: number;
  destination: string;
  main_zone?: string;
  service_zone?: string;
}) {
  try {
    await connectToDataBase();
    const package_id = await generateCustomId(
      Packages,
      "package_id",
      "packageId"
    );

    const newPackage = new Packages({
      package_id,
      name,
      duration,
      company_charge,
      driver_charge,
      fooding_charge,
      over_time_customer_charge,
      over_time_driver_charge,
      early_morning_charge,
      late_night_charge,
      total_price,
      destination,
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
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  min_price?: number;
  max_price?: number;
}) {
  try {
    await connectToDataBase();

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
      query.destination = { $regex: search, $options: "i" };
    }

    if (typeof status === "boolean") {
      query.status = status;
    }

    if (min_price) {
      query.company_charge = { $gte: min_price };
      query.driver_charge = { $gte: min_price };
      query.fooding_charge = { $gte: min_price };
      query.over_time_customer_charge = { $gte: min_price };
      query.over_time_driver_charge = { $gte: min_price };
      query.early_morning_charge = { $gte: min_price };
      query.late_night_charge = { $gte: min_price };
      query.total_price = { $gte: min_price };
    }

    if (max_price) {
      query.company_charge = { $lte: max_price };
      query.driver_charge = { $lte: max_price };
      query.fooding_charge = { $lte: max_price };
      query.over_time_customer_charge = { $lte: max_price };
      query.over_time_driver_charge = { $lte: max_price };
      query.early_morning_charge = { $lte: max_price };
      query.late_night_charge = { $lte: max_price };
      query.total_price = { $lte: max_price };
    }

    const packages = await Packages.find(query)
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
