"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Packages from "@/models/Packages";
import Zone from "@/models/Zones";
import { isPointInPolygon } from "@/utils/geospatialUtils";
import { NextRequest, NextResponse } from "next/server";

function formatPackage(pkg: any, outsideMainZone: boolean = false) {
  return {
    _id: pkg._id,
    package_id: pkg.package_id,
    name: pkg.name,
    duration: pkg.duration,
    package_type: pkg.package_type,
    company_charge: pkg.company_charge,
    driver_charge: pkg.driver_charge,
    fooding_charge: pkg.fooding_charge,
    over_time_customer_charge: pkg.over_time_customer_charge,
    over_time_driver_charge: pkg.over_time_driver_charge,
    early_morning_charge: pkg.early_morning_charge,
    late_night_charge: pkg.late_night_charge,
    service_booking_charge: pkg.service_booking_charge || 0,
    total_price: pkg.total_price,
    destination: pkg.destination,
    discount_type: pkg.discount_type,
    discount: pkg.discount,
    main_zone: pkg.main_zone,
    service_zone: pkg.service_zone
      ? {
          zone_id: pkg.service_zone.zone_id,
          name: pkg.service_zone.name,
          coordinates: pkg.service_zone.coordinates,
        }
      : null,
    outside_main_zone: outsideMainZone,
    status: pkg.status,
    created_at: pkg.createdAt || pkg.created_at,
    updated_at: pkg.updatedAt || pkg.updated_at,
  };
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const packageTypeParam = searchParams.get("package_type");
    const tripTypeParam = searchParams.get("tripType");

    let zoneIds: any[] = [];
    let isLocationInServiceZone = false;
    let point = null;

    await connectToDatabase();
    await ensureModelsRegistered();

    // Distance-based filtering removed as requested

    // Check if coordinates are provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { message: "Invalid latitude or longitude values", success: false },
          { status: 400 },
        );
      }

      point = { latitude: lat, longitude: lng };

      // Get all active zones with their center coordinates
      const zones = await Zone.find({ status: true })
        .select("_id coordinates center")
        .lean();

      // Find zones that contain the point
      const containingZones = zones.filter(
        (zone) =>
          zone.coordinates && isPointInPolygon(point!, zone.coordinates),
      );

      zoneIds = containingZones.map((zone) => zone._id);
      isLocationInServiceZone = containingZones.length > 0;

      // Distance calculation to zone centers removed
    }

    // Build query
    const packageQuery: any = {
      status: true,
    };

    if (packageTypeParam) {
      packageQuery.package_type = packageTypeParam;
    }

    // Build OR conditions
    const orConditions: any[] = [];

    // Always include drop_pickup_service
    orConditions.push({ package_type: "drop_pickup_service" });

    // Add service zone packages if inside service zone
    if (isLocationInServiceZone) {
      const serviceZoneCondition: any = {
        service_zone: { $in: zoneIds },
      };

      orConditions.push(serviceZoneCondition);
    }

    // If no coordinates provided, just get drop_pickup_service
    if (!latitude || !longitude) {
      packageQuery.package_type = "drop_pickup_service";
    } else {
      packageQuery.$or = orConditions;
    }

    // Fetch packages
    const packages = await Packages.find(packageQuery)
      .populate({
        path: "service_zone",
        select: "zone_id name coordinates center",
      })
      .populate({
        path: "main_zone",
        select: "zone_id name coordinates",
      })
      .lean();

    // Format the response with main_zone containment check
    const formattedPackages = packages.map((pkg) => {
      let outsideMainZone = false;

      if (point && pkg.service_zone && pkg.main_zone) {
        const inMainZone = isPointInPolygon(
          point,
          pkg.main_zone.coordinates || []
        );
        outsideMainZone = !inMainZone;
      }

      return formatPackage(pkg, outsideMainZone);
    });

    // Prepare response metadata
    const responseData: any = {
      packages: formattedPackages,
      count: formattedPackages.length,
      location_provided: !!latitude && !!longitude,
      location_in_service_zone: isLocationInServiceZone,
      success: true,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}
