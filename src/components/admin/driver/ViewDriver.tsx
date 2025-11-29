"use client";

import Image from "next/image";
import { DriverDocument } from "@/types/types";
import Link from "next/link";

const Field = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-col mb-3">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || "-"}</span>
  </div>
);

const FilePreview = ({ file }: any) => {
  if (!file?.secure_url)
    return <p className="text-xs text-gray-500">No file uploaded.</p>;

  const isPDF = file.secure_url.endsWith(".pdf");

  return (
    <div className="mt-2">
      {isPDF ? (
        <a
          href={file.secure_url}
          target="_blank"
          className="text-blue-600 underline text-sm"
        >
          View PDF Document
        </a>
      ) : (
        <Image
          src={file.secure_url}
          alt="Preview"
          width={120}
          height={120}
          className="rounded-md border object-cover"
        />
      )}
    </div>
  );
};

const ViewDriver = ({ driver }: { driver: DriverDocument }) => {
  const vd = driver.vehicle_details;

  return (
    <div className="p-5 w-full max-h-screen overflow-y-auto">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">
        Driver Details
      </h1>

      {/* ========== DRIVER BASIC INFO ========== */}
      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <Field label="Driver Name" value={driver.driver_name} />
        <Field label="Mobile Number" value={driver.mobile_number} />
        <Field label="Emergency Number" value={driver.emergency_number} />
        <Field label="City / Area" value={driver.city_area} />
        <Field label="Address" value={driver.address} />
        <Field label="Landmark" value={driver.landmark} />
        <Field label="Pin Code" value={driver.pin_code} />
        <Field label="Employment Type" value={driver.employment_type} />
        <Field label="Remarks" value={driver.remarks} />
      </div>
      <div className=" grid grid-cols-2 gap-4">
        {/* ========== IDENTITY INFO ========== */}
        <div className=" flex flex-col gap-2">
          <h2 className="text-md font-semibold mt-6 mb-2">
            Identity Information
          </h2>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <Field label="Identity Type" value={driver.identity_id_type} />
            <Field label="Identity Number" value={driver.identity_id_number} />
            <div className=" flex justify-between items-center">
                <div className=" flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-700">
              Identity Proof
            </span>
            <FilePreview file={driver.identity_id_proof_url} />
            </div>
             <Link href={driver.identity_id_proof_url?.secure_url ?? ""} target="_blank" className=" text-sm font-semibold cursor-pointer">View Identity</Link>
            </div>
          </div>
        </div>
        <div className=" flex flex-col gap-2">
          {/* ========== LICENSE INFO ========== */}
          <h2 className="text-md font-semibold mt-6 mb-2">
            Licence Information
          </h2>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <Field label="Licence Number" value={driver.licence_no} />
            <Field
              label="Licence Expiry"
              value={
                driver.licence_expiry_date
                  ? new Date(driver.licence_expiry_date).toLocaleDateString()
                  : "-"
              }
            />
            <div className=" flex justify-between items-center">
                <div className=" flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-700">
              Licence Document
            </span>
            <FilePreview file={driver.licence_file_url} />
            </div>
            <Link href={driver.licence_file_url?.secure_url ?? ""} target="_blank" className=" text-sm font-semibold cursor-pointer">View Document</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========== VEHICLE DETAILS ========== */}
      {driver.employment_type === "Driver+Car" && vd && (
        <>
          <h2 className="text-md font-semibold mt-6 mb-2">Vehicle Details</h2>
          <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-2 gap-4">
            <Field label="Car Name" value={vd.car_name} />
            <Field
              label="Model Name & Number"
              value={vd.model_name_and_number}
            />
            <Field label="Car Number" value={vd.car_number} />
            <Field label="Registration Number" value={vd.reg_number} />
            <Field label="Description" value={vd.desc} />
          </div>

          {/* Car Images */}
          <h3 className="text-sm font-semibold mt-4">Car Images & RC</h3>
          <div className="flex flex-wrap gap-3 mt-2">
            {vd.car_images_and_rc && vd.car_images_and_rc.length > 0 ? (
              vd.car_images_and_rc.map((img, index) => (
                <div key={index} className="border rounded-md p-1">
                  <Image
                    src={img.secure_url}
                    alt="car image"
                    width={120}
                    height={120}
                    className="rounded-md object-cover"
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No car images uploaded.</p>
            )}
          </div>

          {/* Insurance, Road Tax, Pollution */}
          <h2 className="text-md font-semibold mt-6 mb-2">
            Insurance & Documents
          </h2>

          <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-2 gap-4">
            {/* Insurance */}
            <Field label="Insurance Number" value={vd.insurance_number} />
            <Field
              label="Insurance Expiry"
              value={
                vd.insurance_expiry
                  ? new Date(vd.insurance_expiry).toLocaleDateString()
                  : "-"
              }
            />
            <span className="text-xs font-medium text-gray-700 col-span-2">
              Insurance Document
            </span>
            <FilePreview file={vd.insurance_document} />

            {/* Road Tax */}
            <Field label="Road Tax Number" value={vd.road_tax_number} />
            <Field
              label="Road Tax Expiry"
              value={
                vd.road_tax_expiry
                  ? new Date(vd.road_tax_expiry).toLocaleDateString()
                  : "-"
              }
            />
            <span className="text-xs font-medium text-gray-700 col-span-2">
              Road Tax Document
            </span>
            <FilePreview file={vd.road_tax_document} />

            {/* Pollution */}
            <Field label="Pollution Number" value={vd.pollution_number} />
            <Field
              label="Pollution Expiry"
              value={
                vd.pollution_expiry
                  ? new Date(vd.pollution_expiry).toLocaleDateString()
                  : "-"
              }
            />
            <span className="text-xs font-medium text-gray-700 col-span-2">
              Pollution Document
            </span>
            <FilePreview file={vd.pollution_document} />
          </div>
        </>
      )}
    </div>
  );
};

export default ViewDriver;
