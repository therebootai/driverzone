"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Drivers from "@/models/Drivers";
import Booking from "@/models/Booking";
import Alert from "@/models/Alert";
import { handleImageUpload } from "@/utils/handleImageUpload";
import { verifyDriverToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { socketService, EVENTS as SOCKET_EVENTS } from "@/lib/socket";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }
    await connectToDatabase();
    await ensureModelsRegistered();
    const user = await verifyDriverToken(token.split("Bearer ")[1]);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const deviceId = request.headers.get("x-device-id");

    if (user.approvedDeviceId && user.approvedDeviceId !== deviceId) {
      return NextResponse.json(
        { message: "This device is no longer approved. Please login again.", logout: true, success: false },
        { status: 401 },
      );
    }

    // Calculate dynamic stats
    const total_rides = await Booking.countDocuments({
      driverDetails: user._id,
      status: "completed",
    });

    const totalAlerts = await Alert.countDocuments({
      "assignedDrivers.driverId": user._id,
    });

    const acceptedAlerts = await Alert.countDocuments({
      "assignedDrivers.driverId": user._id,
      "assignedDrivers.response": "accepted",
    });

    const accept_rate = totalAlerts > 0 ? Math.round((acceptedAlerts / totalAlerts) * 100) : 0;
    
    // Find active booking
    const currentBooking = await Booking.findOne({
      driverDetails: user._id,
      status: { $in: ["accepted", "arrived", "started"] }
    }).populate("customerDetails package_type coupon").lean();

    const userWithStats = {
      ...user,
      total_rides,
      accept_rate,
      currentBooking: currentBooking || null,
    };

    return NextResponse.json({ user: userWithStats, success: true }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    await connectToDatabase();
    await ensureModelsRegistered();

    const user = await verifyDriverToken(token.split("Bearer ")[1]);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const updateData: any = {};

    const avatar = formData.get("avatar") as File | null;
    const psNoc = formData.get("ps_noc") as File | null;
    const licence_file_img_1 = formData.get("licence_file_img_1") as File | null;
    const licence_file_img_2 = formData.get("licence_file_img_2") as File | null;

    if (avatar) {
      updateData.avatar = await handleImageUpload(
        avatar,
        user.avatar?.public_id,
      );
    }

    if (psNoc) {
      updateData.ps_noc = await handleImageUpload(
        psNoc,
        user.ps_noc?.public_id,
      );
    }

    if (licence_file_img_1) {
      updateData.licence_file_img_1 = await handleImageUpload(
        licence_file_img_1,
        (user as any).licence_file_img_1?.public_id,
      );
    }

    if (licence_file_img_2) {
      updateData.licence_file_img_2 = await handleImageUpload(
        licence_file_img_2,
        (user as any).licence_file_img_2?.public_id,
      );
    }


    for (const key of formData.keys()) {
      // Skip already processed image fields
      if (
        key === "avatar" ||
        key === "ps_noc" ||
        key === "licence_file_img_1" ||
        key === "licence_file_img_2"
      )
        continue;

      // Handle other fields
      if (key.endsWith("[]")) {
        const actualKey = key.slice(0, -2);
        const values = formData.getAll(key);
        // Clean each value: if it's a string that looks like a JSON array, parse it.
        const cleanedValues = values.flatMap((v: any) => {
          if (typeof v === "string" && v.startsWith("[") && v.endsWith("]")) {
            try {
              const parsed = JSON.parse(v);
              return Array.isArray(parsed) ? parsed : v;
            } catch (e) {
              return v;
            }
          }
          return v;
        });
        updateData[actualKey] = cleanedValues;
      } else if (key === "currentLocation" && typeof formData.get(key) === "string") {
        const value = formData.get(key) as string;
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.lastUpdated) {
            parsed.lastUpdated = new Date(parsed.lastUpdated);
          }
          updateData[key] = parsed;
        } catch (e) {
          updateData[key] = value;
        }
      } else if (key === "currentLocation.lastUpdated") {
        updateData[key] = new Date(formData.get(key) as string);
      } else {
        const value = formData.get(key);
        // Handle boolean strings
        if (value === "true") {
          updateData[key] = true;
        } else if (value === "false") {
          updateData[key] = false;
        } else {
          updateData[key] = value;
        }
      }
    }

    if (updateData.fcmToken) {
      // Remove this fcmToken from any other driver record
      await Drivers.updateMany(
        { _id: { $ne: user._id }, fcmToken: updateData.fcmToken },
        { $unset: { fcmToken: "" } }
      );
    }

    // Handle identity_documents (multiple) from dynamic fields
    const identityDocsArray: any[] = [];
    let meIdIdx = 0;
    while (formData.has(`identity_id_type_${meIdIdx}`) || formData.has(`identity_id_number_${meIdIdx}`)) {
      const docEntry: any = {
        identity_id_type: formData.get(`identity_id_type_${meIdIdx}`) as string || "",
        identity_id_number: formData.get(`identity_id_number_${meIdIdx}`) as string || "",
      };
      const proofFile1 = formData.get(`identity_id_proof_img_1_${meIdIdx}`) as File | null;
      if (proofFile1) {
        const existing1 = (user as any).identity_documents?.[meIdIdx]?.identity_id_proof_img_1;
        docEntry.identity_id_proof_img_1 = await handleImageUpload(proofFile1, existing1?.public_id);
      } else if ((user as any).identity_documents?.[meIdIdx]?.identity_id_proof_img_1) {
        docEntry.identity_id_proof_img_1 = (user as any).identity_documents[meIdIdx].identity_id_proof_img_1;
      }
      const proofFile2 = formData.get(`identity_id_proof_img_2_${meIdIdx}`) as File | null;
      if (proofFile2) {
        const existing2 = (user as any).identity_documents?.[meIdIdx]?.identity_id_proof_img_2;
        docEntry.identity_id_proof_img_2 = await handleImageUpload(proofFile2, existing2?.public_id);
      } else if ((user as any).identity_documents?.[meIdIdx]?.identity_id_proof_img_2) {
        docEntry.identity_id_proof_img_2 = (user as any).identity_documents[meIdIdx].identity_id_proof_img_2;
      }
      identityDocsArray.push(docEntry);

      // Clean up dynamic field names from updateData
      delete updateData[`identity_id_type_${meIdIdx}`];
      delete updateData[`identity_id_number_${meIdIdx}`];
      delete updateData[`identity_id_proof_img_1_${meIdIdx}`];
      delete updateData[`identity_id_proof_img_2_${meIdIdx}`];
      meIdIdx++;
    }
    if (identityDocsArray.length > 0) {
      updateData.identity_documents = identityDocsArray;
    }

    const updatedUser = await Drivers.findOneAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true },
    ).lean();

    if (!updatedUser) {
      throw new Error("User not found after update");
    }


    // Calculate dynamic stats for updated user
    const total_rides = await Booking.countDocuments({
      driverDetails: updatedUser._id,
      status: "completed",
    });

    const totalAlerts = await Alert.countDocuments({
      "assignedDrivers.driverId": updatedUser._id,
    });

    const acceptedAlerts = await Alert.countDocuments({
      "assignedDrivers.driverId": updatedUser._id,
      "assignedDrivers.response": "accepted",
    });

    const accept_rate = totalAlerts > 0 ? Math.round((acceptedAlerts / totalAlerts) * 100) : 0;

    // Find active booking for updated user
    const currentBooking = await Booking.findOne({
      driverDetails: updatedUser._id,
      status: { $in: ["accepted", "arrived", "started"] }
    }).populate("customerDetails package_type coupon").lean();

    // Emit real-time location event if present
    if (updateData.currentLocation) {
      const locationPayload = {
        driverId: updatedUser._id.toString(),
        location: updateData.currentLocation,
        bookingId: currentBooking?._id?.toString(),
      };
      
      // Emit to admin
      socketService.emit(SOCKET_EVENTS.DRIVER_LOCATION, locationPayload, "admin");
      
      // If on a ride, notify specific booking
      if (currentBooking?._id) {
        socketService.emit(SOCKET_EVENTS.DRIVER_LOCATION, locationPayload, `ride:${currentBooking._id.toString()}`);
      }
    }

    const userWithStats = {
      ...updatedUser,
      total_rides,
      accept_rate,
      currentBooking: currentBooking || null,
    };

    return NextResponse.json(
      { user: userWithStats, success: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "10mb",
//     },
//   },
// };