"use server";
import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Drivers from "@/models/Drivers";
import { deleteFile, uploadFile } from "@/utils/cloudinary";
import { generateCustomId } from "@/utils/generateCustomId";
import { parseImage } from "@/utils/parseFiles";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import mongoose from "mongoose";

await ensureModelsRegistered();

export async function createDriver(formData: FormData) {
  try {
    await connectToDatabase();

    const mobile_number = formData.get("mobile_number") as string;
    const emergency_number = formData.get("emergency_number") as string | null;

    const driverData: any = {
      driver_name: formData.get("driver_name"),
      mobile_number,
      emergency_number,
      address: formData.get("address"),
      city_area: formData.get("city_area"),
      landmark: formData.get("landmark"),
      pin_code: formData.get("pin_code"),

      identity_id_type: formData.get("identity_id_type"),
      identity_id_number: formData.get("identity_id_number"),

      licence_no: formData.get("licence_no"),
      licence_expiry_date: formData.get("licence_expiry_date")
        ? new Date(formData.get("licence_expiry_date") as string)
        : undefined,

      employment_type: formData.get("employment_type"),
      remarks: formData.get("remarks"),
      status: true,

      vehicle_transmission_type:
        (formData.get("vehicle_transmission_type") as string) ||
        "Automatic+Manual",
      vehicle_category_type: formData.getAll(
        "vehicle_category_type",
      ) as string[],

      vehicle_details: {
        car_name: formData.get("car_name"),
        model_name_and_number: formData.get("model_name_and_number"),
        car_number: formData.get("car_number"),
        reg_number: formData.get("reg_number"),
        desc: formData.get("desc"),
        car_images_and_rc: [],

        insurance_number: formData.get("insurance_number"),
        insurance_expiry: formData.get("insurance_expiry")
          ? new Date(formData.get("insurance_expiry") as string)
          : undefined,

        road_tax_number: formData.get("road_tax_number"),
        road_tax_expiry: formData.get("road_tax_expiry")
          ? new Date(formData.get("road_tax_expiry") as string)
          : undefined,

        pollution_number: formData.get("pollution_number"),
        pollution_expiry: formData.get("pollution_expiry")
          ? new Date(formData.get("pollution_expiry") as string)
          : undefined,
      },
      verified: true,
    };
    //@ts-ignore
    const existingMobileNumer = await Drivers.findOne({ mobile_number });
    if (existingMobileNumer) {
      return { success: false, error: "This mobile number already exists" };
    }

    if (emergency_number) {
      const existingEmergencyMobileNumer = await Drivers.findOne({
        emergency_number,
      });
      if (existingEmergencyMobileNumer) {
        return {
          success: false,
          error: "This Emergency mobile number already exists",
        };
      }
    }

    async function handleSingleFile(fieldName: string) {
      const file = formData.get(fieldName) as File | null;
      if (!file || file.size === 0) return undefined;

      const tempPath = await parseImage(file);
      const uploaded: any = await uploadFile(tempPath, file.type);
      await fs.unlink(tempPath);

      return {
        public_id: uploaded.public_id,
        secure_url: uploaded.secure_url,
      };
    }

    const idProof = await handleSingleFile("identity_id_proof_url");
    if (idProof) {
      driverData.identity_id_proof_url = idProof;
    }

    const licenceDoc = await handleSingleFile("licence_file_url");
    if (licenceDoc) {
      driverData.licence_file_url = licenceDoc;
    }

    const insuranceDoc = await handleSingleFile("insurance_document");
    if (insuranceDoc) {
      driverData.vehicle_details.insurance_document = insuranceDoc;
    }

    const roadTaxDoc = await handleSingleFile("road_tax_document");
    if (roadTaxDoc) {
      driverData.vehicle_details.road_tax_document = roadTaxDoc;
    }

    const pollutionDoc = await handleSingleFile("pollution_document");
    if (pollutionDoc) {
      driverData.vehicle_details.pollution_document = pollutionDoc;
    }

    const psNoc = await handleSingleFile("ps_noc");
    if (psNoc) {
      driverData.ps_noc = psNoc;
    }

    const avatar = await handleSingleFile("avatar");
    if (avatar) {
      driverData.avatar = avatar;
    }

    const carFiles = formData.getAll("car_images_and_rc") as File[];

    for (const file of carFiles) {
      if (!file || file.size === 0) continue;

      const tempPath = await parseImage(file);
      const uploaded: any = await uploadFile(tempPath, file.type);
      await fs.unlink(tempPath);

      driverData.vehicle_details.car_images_and_rc.push({
        public_id: uploaded.public_id,
        secure_url: uploaded.secure_url,
      });
    }

    if (driverData.employment_type !== "Driver+Car") {
      driverData.vehicle_details = undefined;
    }

    driverData.driver_id = await generateCustomId(
      Drivers,
      "driver_id",
      "driverId",
    );

    const newDriver = new Drivers(driverData);
    const savedDriver = await newDriver.save();

    revalidatePath("/driver-managment");

    return {
      success: true,
      driver: JSON.parse(JSON.stringify(savedDriver)),
    };
  } catch (error: any) {
    console.error("Error creating Driver:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAllDriver({
  page = 1,
  limit = 20,
  searchTerm,
  status,
  isOnline,
  verified,
}: {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: boolean;
  isOnline?: boolean;
  verified?: boolean;
}) {
  try {
    await connectToDatabase();

    const _page = Math.max(1, Number(page) || 1);
    const _limit = Math.max(1, Math.min(100, Number(limit) || 20));

    const andConditions: any[] = [];

    if (typeof status === "boolean") {
      andConditions.push({ status });
    }

    if (typeof isOnline === "boolean") {
      andConditions.push({ isOnline });
    }

    if (typeof verified === "boolean") {
      andConditions.push({ verified });
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const term = escapeRegex(searchTerm.trim());
      andConditions.push({
        $or: [
          { driver_name: { $regex: term, $options: "i" } },
          { mobile_number: { $regex: term, $options: "i" } },
        ],
      });
    }

    const query = andConditions.length ? { $and: andConditions } : {};

    const [allDriver, totalCoupon] = await Promise.all([
      //@ts-ignore
      Drivers.find(query, { password: 0 })
        .sort({ createdAt: -1 })
        .skip((_page - 1) * _limit)
        .limit(_limit)
        .lean(),
      Drivers.countDocuments(query),
    ]);

    const serializedDrivers = JSON.parse(JSON.stringify(allDriver));

    return {
      success: true,
      data: serializedDrivers,
      paginations: {
        totalPages: Math.ceil(totalCoupon / _limit),
        currentPage: _page,
        totalItems: totalCoupon,
        perPage: _limit,
      },
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error?.message || "Unknown error",
      data: [],
      paginations: {
        totalPages: 0,
        currentPage: 1,
        totalItems: 0,
        perPage: 20,
      },
    };
  }
}

export async function updateDriver(driverId: string, formData: FormData) {
  try {
    await connectToDatabase();

    // 1. Find existing driver
    //@ts-ignore
    const driver = await Drivers.findOne({ driver_id: driverId });
    if (!driver) {
      return { success: false, error: "Driver not found" };
    }

    // 2. Handle mobile & emergency uniqueness (exclude current driver)
    const mobile_number = formData.get("mobile_number") as string | null;
    const emergency_number = formData.get("emergency_number") as string | null;

    if (mobile_number && mobile_number !== driver.mobile_number) {
      const existingMobile = await Drivers.findOne({
        mobile_number,
        _id: { $ne: driver._id },
      });
      if (existingMobile) {
        return {
          success: false,
          error: "This mobile number already exists",
        };
      }
      driver.mobile_number = mobile_number;
    }

    if (emergency_number && emergency_number !== driver.emergency_number) {
      const existingEmergency = await Drivers.findOne({
        emergency_number,
        _id: { $ne: driver._id },
      });
      if (existingEmergency) {
        return {
          success: false,
          error: "This Emergency mobile number already exists",
        };
      }
      driver.emergency_number = emergency_number;
    }

    // Helper to update simple text fields
    const setIfPresent = (field: keyof typeof driver, key: string) => {
      const value = formData.get(key);
      if (value !== null) {
        // @ts-ignore
        driver[field] = value === "" ? "" : value;
      }
    };

    // 3. Update scalar fields
    setIfPresent("driver_name", "driver_name");
    setIfPresent("address", "address");
    setIfPresent("city_area", "city_area");
    setIfPresent("landmark", "landmark");
    setIfPresent("pin_code", "pin_code");

    setIfPresent("identity_id_type", "identity_id_type");
    setIfPresent("identity_id_number", "identity_id_number");

    setIfPresent("licence_no", "licence_no");

    const licenceExpiry = formData.get("licence_expiry_date");
    if (licenceExpiry !== null && licenceExpiry !== "") {
      driver.licence_expiry_date = new Date(licenceExpiry as string);
    }

    const employment_type = formData.get("employment_type") as
      | "Driver"
      | "Driver+Car"
      | "Other"
      | null;
    if (employment_type) {
      driver.employment_type = employment_type;
    }

    const remarks = formData.get("remarks");
    if (remarks !== null) {
      driver.remarks = remarks as string;
    }

    // 4. Arrays: transmission & category
    const vehicle_transmission_type =
      (formData.get("vehicle_transmission_type") as string) ||
      "Automatic+Manual";
    driver.vehicle_transmission_type = vehicle_transmission_type;

    const vehicle_category_type = formData.getAll(
      "vehicle_category_type",
    ) as string[];
    driver.vehicle_category_type = vehicle_category_type;

    // Ensure vehicle_details exists if needed
    if (!driver.vehicle_details) {
      // @ts-ignore
      driver.vehicle_details = {};
    }

    // 5. Update vehicle_details scalar fields (if Driver+Car)
    if (driver.employment_type === "Driver+Car") {
      const vd = driver.vehicle_details as any;

      const car_name = formData.get("car_name");
      if (car_name !== null) vd.car_name = car_name;

      const model_name_and_number = formData.get("model_name_and_number");
      if (model_name_and_number !== null)
        vd.model_name_and_number = model_name_and_number;

      const car_number = formData.get("car_number");
      if (car_number !== null) vd.car_number = car_number;

      const reg_number = formData.get("reg_number");
      if (reg_number !== null) vd.reg_number = reg_number;

      const desc = formData.get("desc");
      if (desc !== null) vd.desc = desc;

      const insurance_number = formData.get("insurance_number");
      if (insurance_number !== null) vd.insurance_number = insurance_number;

      const insurance_expiry = formData.get("insurance_expiry");
      if (insurance_expiry !== null && insurance_expiry !== "") {
        vd.insurance_expiry = new Date(insurance_expiry as string);
      }

      const road_tax_number = formData.get("road_tax_number");
      if (road_tax_number !== null) vd.road_tax_number = road_tax_number;

      const road_tax_expiry = formData.get("road_tax_expiry");
      if (road_tax_expiry !== null && road_tax_expiry !== "") {
        vd.road_tax_expiry = new Date(road_tax_expiry as string);
      }

      const pollution_number = formData.get("pollution_number");
      if (pollution_number !== null) vd.pollution_number = pollution_number;

      const pollution_expiry = formData.get("pollution_expiry");
      if (pollution_expiry !== null && pollution_expiry !== "") {
        vd.pollution_expiry = new Date(pollution_expiry as string);
      }
    } else {
      // If not Driver+Car, optional: keep or clear vehicle_details
      // driver.vehicle_details = undefined; // uncomment if you want to clear
    }

    async function handleSingleFileReplace(
      fieldName: string,
      existing?: { public_id?: string | null },
    ) {
      const file = formData.get(fieldName) as File | null;
      if (!file || file.size === 0) return undefined;

      // delete old image from Cloudinary
      if (existing?.public_id) {
        await deleteFile(existing.public_id);
      }

      const tempPath = await parseImage(file);
      const uploaded: any = await uploadFile(tempPath, file.type);
      await fs.unlink(tempPath);

      return {
        public_id: uploaded.public_id,
        secure_url: uploaded.secure_url,
      };
    }

    // 7. Identity proof
    const newIdProof = await handleSingleFileReplace(
      "identity_id_proof_url",
      driver.identity_id_proof_url as any,
    );
    if (newIdProof) {
      // @ts-ignore
      driver.identity_id_proof_url = newIdProof;
    }

    // 8. Licence file
    const newLicenceFile = await handleSingleFileReplace(
      "licence_file_url",
      driver.licence_file_url as any,
    );
    if (newLicenceFile) {
      // @ts-ignore
      driver.licence_file_url = newLicenceFile;
    }

    const newPsNoc = await handleSingleFileReplace(
      "ps_noc",
      driver.ps_noc as any,
    );
    if (newPsNoc) {
      // @ts-ignore
      driver.ps_noc = newPsNoc;
    }

    const newAvatar = await handleSingleFileReplace(
      "avatar",
      driver.avatar as any,
    );
    if (newAvatar) {
      // @ts-ignore
      driver.avatar = newAvatar;
    }

    // 9. Insurance / Road tax / Pollution docs (under vehicle_details)
    if (driver.employment_type === "Driver+Car") {
      const vd: any = driver.vehicle_details || {};

      const newInsuranceDoc = await handleSingleFileReplace(
        "insurance_document",
        vd.insurance_document,
      );
      if (newInsuranceDoc) {
        vd.insurance_document = newInsuranceDoc;
      }

      const newRoadTaxDoc = await handleSingleFileReplace(
        "road_tax_document",
        vd.road_tax_document,
      );
      if (newRoadTaxDoc) {
        vd.road_tax_document = newRoadTaxDoc;
      }

      const newPollutionDoc = await handleSingleFileReplace(
        "pollution_document",
        vd.pollution_document,
      );
      if (newPollutionDoc) {
        vd.pollution_document = newPollutionDoc;
      }

      driver.vehicle_details = vd;
    }

    // 10. Car images + RC (array) – replace all if new files uploaded
    if (driver.employment_type === "Driver+Car") {
      const carFiles = formData.getAll("car_images_and_rc") as File[];
      const hasNewCarFiles = carFiles.some(
        (file) => file && file.size && file.size > 0,
      );

      if (hasNewCarFiles) {
        const vd: any = driver.vehicle_details || {};

        // delete old car images
        if (vd.car_images_and_rc && Array.isArray(vd.car_images_and_rc)) {
          for (const img of vd.car_images_and_rc) {
            if (img?.public_id) {
              await deleteFile(img.public_id);
            }
          }
        }

        vd.car_images_and_rc = [];

        for (const file of carFiles) {
          if (!file || file.size === 0) continue;

          const tempPath = await parseImage(file);
          const uploaded: any = await uploadFile(tempPath, file.type);
          await fs.unlink(tempPath);

          vd.car_images_and_rc.push({
            public_id: uploaded.public_id,
            secure_url: uploaded.secure_url,
          });
        }

        driver.vehicle_details = vd;
      }
    }

    const status = formData.get("status") as string;
    if (status) {
      driver.status = status === "true";
    }

    const verified = formData.get("verified") as string;
    if (verified) {
      driver.verified = verified === "true";
    }

    // 11. Save updated driver
    const savedDriver = await driver.save();

    revalidatePath("/driver-managment");

    return {
      success: true,
      driver: JSON.parse(JSON.stringify(savedDriver)),
    };
  } catch (error: any) {
    console.error("Error updating Driver:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function updateDriverStatus({
  driver_id,
  status,
  verified,
}: {
  driver_id: string;
  status?: boolean;
  verified?: boolean;
}) {
  try {
    if (!driver_id) {
      return { success: false, message: "Driver ID is required" };
    }

    await connectToDatabase();

    const existing = await Drivers.findOne({
      $or: [
        { driver_id },
        {
          _id: mongoose.Types.ObjectId.isValid(driver_id) ? driver_id : null,
        },
      ],
    });

    if (!existing) {
      return { success: false, message: "Driver not found" };
    }

    if (typeof status === "boolean") {
      existing.status = status;
    }
    if (typeof verified === "boolean") {
      existing.verified = verified;
    }

    const updatedDriver = await existing.save();
    revalidatePath("/driver-managemant");

    return {
      success: true,
      message: "Driver status updated successfully",
      data: JSON.parse(JSON.stringify(updatedDriver)),
    };
  } catch (error) {
    console.error("Error updating Driver status:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function deleteDriver(driver_id: string) {
  try {
    if (!driver_id) {
      return { success: false, message: "Driver ID is required" };
    }

    await connectToDatabase();

    const driver = await Drivers.findOne({ driver_id });

    if (!driver) {
      return { success: false, message: "Driver not found" };
    }

    await Drivers.deleteOne({ driver_id });

    revalidatePath("/driver-management");

    return { success: true, message: "Driver deleted successfully" };
  } catch (error) {
    console.error("Error deleting Driver:", error);
    return { success: false, message: "Internal server error" };
  }
}
