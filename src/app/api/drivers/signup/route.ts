"use server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Driver from "@/models/Drivers";
import { handleImageUpload } from "@/utils/handleImageUpload";
import { generateCustomId } from "@/utils/generateCustomId";
import { NextResponse } from "next/server";
import { generateToken } from "@/utils/jwt";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const driver_name = formData.get("driver_name") as string;
    const mobile_number = formData.get("mobile_number") as string;
    const emergency_number = formData.get("emergency_number") as string;
    const address = formData.get("address") as string;
    const city_area = formData.get("city_area") as string;
    const landmark = formData.get("landmark") as string;
    const pin_code = formData.get("pin_code") as string;
    const identity_id_type = formData.get("identity_id_type") as string;
    const identity_id_number = formData.get("identity_id_number") as string;
    const licence_no = formData.get("licence_no") as string;
    const licence_expiry_date = formData.get("licence_expiry_date") as string;
    const vehicle_transmission_type = (formData.get(
      "vehicle_transmission_type",
    ) as string) || "Automatic+Manual";
    const vehicle_category_type = formData.get(
      "vehicle_category_type",
    ) as string;

    await connectToDatabase();
    await ensureModelsRegistered();

    //@ts-ignore
    const driver = await Driver.findOne({ mobile_number });
    if (driver) {
      return NextResponse.json(
        { message: "Driver already exists", success: false },
        { status: 400 },
      );
    }

    let identity_id_proof_url;
    let licence_file_url;
    let ps_noc_url;
    let avatar_url;

    const identityIdProof = formData.get("identity_id_proof") as File | null;
    const licenceFile = formData.get("licence_file") as File | null;
    const psNoc = formData.get("ps_noc") as File | null;
    const avatar = formData.get("avatar") as File | null;

    if (identityIdProof) {
      identity_id_proof_url = await handleImageUpload(identityIdProof);
    }

    if (licenceFile) {
      licence_file_url = await handleImageUpload(licenceFile);
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
      licence_no,
      licence_expiry_date,
      licence_file_url,
      ps_noc: ps_noc_url,
      vehicle_transmission_type,
      vehicle_category_type,
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
