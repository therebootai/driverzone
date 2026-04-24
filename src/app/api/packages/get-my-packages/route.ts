"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Packages from "@/models/Packages";
import Zone from "@/models/Zones";
import { isPointInPolygon } from "@/utils/geospatialUtils";
import { NextRequest, NextResponse } from "next/server";

function formatPackage(pkg: any, outsideMainZone: boolean = false) {
  const serviceBookingCharge = pkg.service_booking_charge || 0;

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
    service_booking_charge: serviceBookingCharge,
    total_price: outsideMainZone
      ? pkg.total_price + serviceBookingCharge
      : pkg.total_price,
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
    drop_zone: pkg.drop_zone
      ? {
          zone_id: pkg.drop_zone.zone_id,
          name: pkg.drop_zone.name,
        }
      : null,
    outside_main_zone: outsideMainZone,
    status: pkg.status,
    created_at: pkg.createdAt || pkg.created_at,
    updated_at: pkg.updatedAt || pkg.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const packageTypeParam = searchParams.get("package_type");
    const tripTypeParam = searchParams.get("tripType");
    const stopLatParam = searchParams.get("stopLat");
    const stopLngParam = searchParams.get("stopLng");
    const dropLatParam = searchParams.get("dropLat");
    const dropLngParam = searchParams.get("dropLng");

    let zoneIds: any[] = [];
    let isLocationInServiceZone = false;
    let point: { latitude: number; longitude: number } | null = null;
    let stopPoint: { latitude: number; longitude: number } | null = null;

    await connectToDatabase();
    await ensureModelsRegistered();

    // Parse pickup coordinates
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { message: "Invalid latitude or longitude values", success: false },
          { status: 400 },
        );
      }

      point = { latitude: lat, longitude: lng };
    }

    // Parse stop coordinates (for round-trip)
    if (stopLatParam && stopLngParam) {
      const sLat = parseFloat(stopLatParam);
      const sLng = parseFloat(stopLngParam);

      if (!isNaN(sLat) && !isNaN(sLng) && sLat >= -90 && sLat <= 90 && sLng >= -180 && sLng <= 180 && (sLat !== 0 || sLng !== 0)) {
        stopPoint = { latitude: sLat, longitude: sLng };
      }
    }

    let dropPoint: { latitude: number; longitude: number } | null = null;
    if (dropLatParam && dropLngParam) {
      const dLat = parseFloat(dropLatParam);
      const dLng = parseFloat(dropLngParam);
      if (!isNaN(dLat) && !isNaN(dLng) && dLat >= -90 && dLat <= 90 && dLng >= -180 && dLng <= 180 && (dLat !== 0 || dLng !== 0)) {
        dropPoint = { latitude: dLat, longitude: dLng };
      }
    }

    // For round-trip: drop target is the stop point
    // For one-way: drop target is the drop point
    const dropTarget = tripTypeParam === "round-trip" ? stopPoint : dropPoint;

    if (point) {
      const zones = await Zone.find({ status: true })
        .select("_id coordinates")
        .lean();

      // Find zones that contain the pickup point only
      // Drop/stop location is validated against drop_zone later
      const containingZones = zones.filter(
        (zone) =>
          zone.coordinates && isPointInPolygon(point!, zone.coordinates),
      );

      zoneIds = containingZones.map((zone) => zone._id);
      isLocationInServiceZone = containingZones.length > 0;
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

    // Add packages matching by main_zone or service_zone
    if (isLocationInServiceZone) {
      orConditions.push({ main_zone: { $in: zoneIds } });
      orConditions.push({ service_zone: { $in: zoneIds } });
    }

    // If no coordinates provided, just get drop_pickup_service
    if (!latitude || !longitude) {
      packageQuery.package_type = "drop_pickup_service";
    } else {
      packageQuery.$or = orConditions;
    }

    // Fetch packages with drop_zone populated
    const packages = await Packages.find(packageQuery)
      .populate({
        path: "service_zone",
        select: "zone_id name coordinates center",
      })
      .populate({
        path: "main_zone",
        select: "zone_id name coordinates",
      })
      .populate({
        path: "drop_zone",
        select: "zone_id name coordinates",
      })
      .lean();

    // Filter by drop_zone if drop/stop coordinates are available
    const filteredByDropZone = dropTarget
      ? packages.filter((pkg: any) => {
          if (!pkg.drop_zone || !pkg.drop_zone.coordinates) return false;
          return isPointInPolygon(dropTarget!, pkg.drop_zone.coordinates);
        })
      : packages;

    // Format the response with main_zone containment check
    const formattedPackages = filteredByDropZone.map((pkg: any) => {
      let outsideMainZone = false;

      if (point && pkg.service_zone && pkg.main_zone) {
        const inMainZone = isPointInPolygon(
          point,
          pkg.main_zone.coordinates || [],
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

    if (stopPoint) {
      responseData.stop_location_provided = true;
    }

    if (dropTarget) {
      responseData.drop_location_provided = true;
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}
