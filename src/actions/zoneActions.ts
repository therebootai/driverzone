"use server";

import connectToDataBase from "@/db/connection";
import Zone from "@/models/Zones";
import { generateCustomId } from "@/utils/generateCustomId";
import { calculateArea, calculateCenter } from "@/utils/geoutils";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function CREATEZONE({
  name,
  description,
  coordinates,
}: {
  name: string;
  description?: string;
  coordinates: number[][];
}) {
  try {
    if (!coordinates || coordinates.length < 3) {
      return {
        success: false,
        message: "A zone must have at least 3 coordinates to form a polygon",
      };
    }

    await connectToDataBase();

    const center = calculateCenter(coordinates);

    const area = calculateArea(coordinates);

    const zone_id = await generateCustomId(Zone, "zone_id", "zoneId");

    const zone = await Zone.create({
      zone_id,
      name,
      description,
      coordinates,
      area,
      center: {
        type: "Point",
        coordinates: center,
      },
    });

    revalidatePath("/admin/zone-management");

    return {
      success: true,
      message: "Zone created successfully",
      data: JSON.parse(JSON.stringify(zone)),
    };
  } catch (error: any) {
    console.error("Error creating zone:", error);
    return { success: false, message: error.message, data: null };
  }
}

export async function GET_ALL_ZONES({
  page = 1,
  limit = 20,
  search,
  status,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
}) {
  try {
    await connectToDataBase();

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
      query.description = { $regex: search, $options: "i" };
    }

    if (typeof status === "boolean") {
      query.status = status;
    }

    const zones = await Zone.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total_zones = await Zone.countDocuments(query);

    return {
      success: true,
      message: "Fetched all zones",
      data: JSON.parse(JSON.stringify(zones)),
      paginations: {
        totalPages: Math.ceil(total_zones / limit),
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

export async function UPDATE_ZONE(id: string, data: any) {
  try {
    const updatedZone = await Zone.updateOne(
      {
        $or: [
          { zone_id: id },
          {
            _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined,
          },
        ],
      },
      { $set: data }
    );

    revalidatePath("/admin/zone-management");
    return { success: true, data: JSON.parse(JSON.stringify(updatedZone)) };
  } catch (error: any) {
    console.log(error);
    return { success: false, error: error.message, data: null };
  }
}
