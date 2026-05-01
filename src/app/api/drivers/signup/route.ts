"use server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Driver from "@/models/Drivers";
import { handleImageUpload } from "@/utils/handleImageUpload";
import { generateCustomId } from "@/utils/generateCustomId";
import { NextResponse } from "next/server";
import { verifyOTP } from "@/actions/OTPActions";
import { generateToken } from "@/utils/jwt";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const driver_name = formData.get("driver_name") as string;
    const mobile_number = formData.get("mobile_number") as string;
    const emergency_number_raw = formData.get("emergency_number") as string;
    const emergency_number = emergency_number_raw === "" ? undefined : emergency_number_raw;
    const address = formData.get("address") as string;
    const city_area = formData.get("city_area") as string;
    const landmark = formData.get("landmark") as string;
    const pin_code = formData.get("pin_code") as string;
    const identity_id_type = formData.get("identity_id_type") as string;
    const identity_id_number = formData.get("identity_id_number") as string;
    const identity_documents_raw: { identity_id_type: string; identity_id_number: string }[] = [];
    let signupIdIdx = 0;
    while (formData.has(`identity_id_type_${signupIdIdx}`) || formData.has(`identity_id_number_${signupIdIdx}`)) {
      identity_documents_raw.push({
        identity_id_type: (formData.get(`identity_id_type_${signupIdIdx}`) as string) || "",
        identity_id_number: (formData.get(`identity_id_number_${signupIdIdx}`) as string) || "",
      });
      signupIdIdx++;
    }
    const licence_no = formData.get("licence_no") as string;
    const licence_expiry_date = formData.get("licence_expiry_date") as string;
    const vehicle_transmission_type = (formData.get(
      "vehicle_transmission_type",
    ) as string) || "Automatic+Manual";
    const vehicle_category_type = formData.getAll(
      "vehicle_category_type",
    ) as string[];
    const speciality = formData.getAll("speciality").length > 0
      ? formData.getAll("speciality") as string[]
      : [
          "in_city",
          "mini_outstation",
          "outstation",
          "hills_tour",
          "long_tour",
          "drop_pickup_service",
        ];

    const deviceId = request.headers.get("x-device-id");
    const fcmToken = formData.get("fcmToken") as string;
    const otp = formData.get("otp") as string;

    await connectToDatabase();
    await ensureModelsRegistered();

    // Verify OTP first
    const otpResult = await verifyOTP(null, mobile_number, otp, "register");
    if (!otpResult.success) {
      return NextResponse.json(
        { message: otpResult.message, success: false },
        { status: 400 },
      );
    }

    const driver = await Driver.findOne({ mobile_number });
    if (driver) {
      return NextResponse.json(
        { message: "Driver already exists", success: false },
        { status: 400 },
      );
    }

    let identity_id_proof_url;
    const identity_documents_files: { identity_id_proof_img_1?: any; identity_id_proof_img_2?: any }[] = [];
    let licence_file_img_1;
    let licence_file_img_2;
    let ps_noc_url;
    let avatar_url;

    const identityIdProof = formData.get("identity_id_proof") as File | null;
    const licenceFile = formData.get("licence_file") as File | null;
    const psNoc = formData.get("ps_noc") as File | null;
    const avatar = formData.get("avatar") as File | null;

    if (identityIdProof) {
      identity_id_proof_url = await handleImageUpload(identityIdProof);
    }

    // Handle identity document proof files (multiple, front/back)
    for (let i = 0; i < identity_documents_raw.length; i++) {
      const docEntry: { identity_id_proof_img_1?: any; identity_id_proof_img_2?: any } = {};
      const docFile1 = formData.get(`identity_id_proof_img_1_${i}`) as File | null;
      const docFile2 = formData.get(`identity_id_proof_img_2_${i}`) as File | null;
      if (docFile1) {
        docEntry.identity_id_proof_img_1 = await handleImageUpload(docFile1);
      }
      if (docFile2) {
        docEntry.identity_id_proof_img_2 = await handleImageUpload(docFile2);
      }
      identity_documents_files.push(docEntry);
    }

    if (licenceFile) {
      licence_file_img_1 = await handleImageUpload(licenceFile);
    }

    const licenceFile2 = formData.get("licence_file_img_2") as File | null;
    if (licenceFile2) {
      licence_file_img_2 = await handleImageUpload(licenceFile2);
    }

    if (psNoc) {
      ps_noc_url = await handleImageUpload(psNoc);
    }

    if (avatar) {
      avatar_url = await handleImageUpload(avatar);
    }

    const driver_id = await generateCustomId(Driver, "driver_id", "DRV");

    const newDriver = new Driver({
      driver_id,
      driver_name,
      mobile_number,
      emergency_number,
      address,
      city_area,
      landmark,
      pin_code,
      identity_id_type,
      identity_id_number,
      avatar: avatar_url,
      identity_id_proof_url,
      identity_documents: identity_documents_raw.map((doc, i) => ({
        identity_id_type: doc.identity_id_type,
        identity_id_number: doc.identity_id_number,
        identity_id_proof_img_1: identity_documents_files[i]?.identity_id_proof_img_1,
        identity_id_proof_img_2: identity_documents_files[i]?.identity_id_proof_img_2,
      })),
      licence_no,
      licence_expiry_date,
      licence_file_img_1,
      licence_file_img_2,
      ps_noc: ps_noc_url,
      vehicle_transmission_type,
      vehicle_category_type,
      speciality,
      fcmToken,
      approvedDeviceId: deviceId,
    });

    const saveuser = await newDriver.save();

    const token = generateToken({ userId: saveuser._id });

    return NextResponse.json(
      { user: saveuser, token, success: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 },
    );
  }
}
