"use server";

import Zone from "@/models/Zones";
import { calculateCenter } from "@/utils/geoutils";

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

    const center = calculateCenter(coordinates);

    const zone = await Zone.create({
      name,
      description,
      coordinates,
      center: {
        type: "Point",
        coordinates: center,
      },
    });

    return {
      success: true,
      message: "Zone created successfully",
      data: JSON.parse(JSON.stringify(zone)),
    };
  } catch (error: any) {
    console.error("Error creating zone:", error);
    return { success: false, message: "Internal server error", data: null };
  }
}
