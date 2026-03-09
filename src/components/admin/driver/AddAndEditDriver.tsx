"use client";

import { createDriver, updateDriver } from "@/actions/driverActions";
import { DriverDocument } from "@/types/types";
import React, { useEffect, useState } from "react";

const AddAndEditDriver = ({
  selectedDriver,
  onSuccess,
}: {
  selectedDriver?: DriverDocument | null;
  onSuccess?: () => void;
}) => {
  const [employmentType, setEmploymentType] = useState<
    "Driver" | "Driver+Car" | "Other"
  >("Driver");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Set employment type from existing driver when editing
  useEffect(() => {
    if (selectedDriver?.employment_type) {
      setEmploymentType(
        selectedDriver.employment_type as "Driver" | "Driver+Car" | "Other",
      );
    }
  }, [selectedDriver]);

  const handleDriver = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    let res;
    if (selectedDriver) {
      // 🔁 UPDATE
      res = await updateDriver(selectedDriver.driver_id, formData);
    } else {
      // ➕ CREATE
      res = await createDriver(formData);
    }

    setIsSubmitting(false);

    if (!res.success) {
      setMessage(res.error || "Something went wrong");
    } else {
      setMessage(
        selectedDriver
          ? "Driver updated successfully"
          : "Driver created successfully",
      );
      onSuccess?.();
    }
  };

  const vd = selectedDriver?.vehicle_details;

  return (
    <div className="flex flex-col gap-5 px-6 py-4">
      <h1 className="text-site-black text-xl font-semibold">
        {selectedDriver ? "Edit Driver" : "Add Driver"}
      </h1>

      {message && <p className="text-sm mt-1 text-red-600">{message}</p>}

      <form
        action={handleDriver} // ✅ no encType when using function action
        className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-6 flex flex-col gap-6"
      >
        {/* ========== DRIVER BASIC DETAILS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Driver Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Driver Name<span className="text-red-500">*</span>
            </label>
            <input
              name="driver_name"
              type="text"
              required
              defaultValue={selectedDriver?.driver_name || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter driver name"
            />
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Mobile Number<span className="text-red-500">*</span>
            </label>
            <input
              name="mobile_number"
              type="tel"
              required
              defaultValue={selectedDriver?.mobile_number || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter mobile number"
            />
          </div>

          {/* Emergency No. */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Emergency No.
            </label>
            <input
              name="emergency_number"
              type="tel"
              defaultValue={selectedDriver?.emergency_number || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter emergency number"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              type="text"
              defaultValue={selectedDriver?.address || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="House / Street"
            />
          </div>

          {/* City/Area */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              City/Area
            </label>
            <input
              name="city_area"
              type="text"
              defaultValue={selectedDriver?.city_area || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="City / Area"
            />
          </div>

          {/* Landmark */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Landmark
            </label>
            <input
              name="landmark"
              type="text"
              defaultValue={selectedDriver?.landmark || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nearby landmark"
            />
          </div>

          {/* Pin Code */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Pin Code
            </label>
            <input
              name="pin_code"
              type="text"
              defaultValue={selectedDriver?.pin_code || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="PIN code"
            />
          </div>

          {/* Identity ID Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Choose Identity ID Type
            </label>
            <select
              name="identity_id_type"
              defaultValue={selectedDriver?.identity_id_type || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Driving Licence">Driving Licence</option>
              <option value="Passport">Passport</option>
            </select>
          </div>

          {/* Identity ID Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Identity ID Number
            </label>
            <input
              name="identity_id_number"
              type="text"
              defaultValue={selectedDriver?.identity_id_number || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter ID number"
            />
          </div>

          {/* Upload Identity ID Proof (file) + preview */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Upload Identity ID Proof
            </label>
            <input
              name="identity_id_proof_url"
              type="file"
              accept="image/*,application/pdf"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {selectedDriver?.identity_id_proof_url?.secure_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Current ID Proof:</p>
                <img
                  src={selectedDriver.identity_id_proof_url.secure_url}
                  alt="ID Proof"
                  className="h-20 w-auto rounded border"
                />
              </div>
            )}
          </div>

          {/* Licence No */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Licence No
            </label>
            <input
              name="licence_no"
              type="text"
              defaultValue={selectedDriver?.licence_no || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter licence number"
            />
          </div>

          {/* Licence Expiry Date */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Licence Expiry Date
            </label>
            <input
              name="licence_expiry_date"
              type="date"
              defaultValue={
                selectedDriver?.licence_expiry_date
                  ? new Date(selectedDriver.licence_expiry_date)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Upload Licence (file) + preview */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Upload Licence
            </label>
            <input
              name="licence_file_url"
              type="file"
              accept="image/*,application/pdf"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {selectedDriver?.licence_file_url?.secure_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Current Licence:</p>
                <img
                  src={selectedDriver.licence_file_url.secure_url}
                  alt="Licence"
                  className="h-20 w-auto rounded border"
                />
              </div>
            )}
          </div>

          {/* Employment Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Choose Employment Type
            </label>
            <select
              name="employment_type"
              value={employmentType}
              onChange={(e) =>
                setEmploymentType(
                  e.target.value as "Driver" | "Driver+Car" | "Other",
                )
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Driver">Driver</option>
              <option value="Driver+Car">Driver + Car</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Vehicle Transmission Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Vehicle Transmission Type
            </label>
            <select
              name="vehicle_transmission_type"
              defaultValue={
                selectedDriver?.vehicle_transmission_type?.includes(
                  "Automatic+Manual",
                ) ||
                (selectedDriver?.vehicle_transmission_type?.includes(
                  "Automatic",
                ) &&
                  selectedDriver?.vehicle_transmission_type?.includes("Manual"))
                  ? "Automatic+Manual"
                  : selectedDriver?.vehicle_transmission_type?.includes(
                        "Automatic",
                      )
                    ? "Automatic"
                    : selectedDriver?.vehicle_transmission_type?.includes(
                          "Manual",
                        )
                      ? "Manual"
                      : ""
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Automatic+Manual">Both</option>
            </select>
          </div>

          {/* Vehicle Category Type (checkbox group) */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">
              Vehicle Category Type
            </span>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {["SUV", "Hatchback", "Sedan", "Others"].map((item) => (
                <label key={item} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="vehicle_category_type"
                    value={item}
                    defaultChecked={selectedDriver?.vehicle_category_type?.includes(
                      item,
                    )}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1 md:col-span-3">
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <input
              name="remarks"
              type="text"
              defaultValue={selectedDriver?.remarks || ""}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Any remarks"
            />
          </div>
        </div>

        {/* ========== VEHICLE DETAILS (Driver+Car only) ========== */}
        {employmentType === "Driver+Car" && (
          <>
            <h2 className="text-base font-semibold text-gray-900 mt-2">
              Vehicle Details{" "}
              <span className="text-xs font-normal text-gray-500">
                (when choose both employment / driver + car)
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Car Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Car Name
                </label>
                <input
                  name="car_name"
                  type="text"
                  defaultValue={vd?.car_name || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Maruti, Hyundai"
                />
              </div>

              {/* Model Name and Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Model Name and Number
                </label>
                <input
                  name="model_name_and_number"
                  type="text"
                  defaultValue={vd?.model_name_and_number || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Swift VXI 2020"
                />
              </div>

              {/* Car Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Car Number
                </label>
                <input
                  name="car_number"
                  type="text"
                  defaultValue={vd?.car_number || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. WB 12 AB 3456"
                />
              </div>

              {/* Reg. Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Reg. Number
                </label>
                <input
                  name="reg_number"
                  type="text"
                  defaultValue={vd?.reg_number || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Registration number"
                />
              </div>

              {/* Upload car 4 side image and RC (multiple) + previews */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Upload car 4 side image and RC
                </label>
                <input
                  name="car_images_and_rc"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {vd?.car_images_and_rc && vd.car_images_and_rc.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Current Car Images & RC:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {vd.car_images_and_rc.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.secure_url}
                          alt={`Car ${idx + 1}`}
                          className="h-16 w-auto rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Desc */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Desc
                </label>
                <input
                  name="desc"
                  type="text"
                  defaultValue={vd?.desc || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Short description"
                />
              </div>

              {/* Insurance Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Insurance Number
                </label>
                <input
                  name="insurance_number"
                  type="text"
                  defaultValue={vd?.insurance_number || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Insurance policy number"
                />
              </div>

              {/* Insurance Expiry */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Insurance Expiry
                </label>
                <input
                  name="insurance_expiry"
                  type="date"
                  defaultValue={
                    vd?.insurance_expiry
                      ? new Date(vd.insurance_expiry)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Insurance Document + preview */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Upload Insurance Document
                </label>
                <input
                  name="insurance_document"
                  type="file"
                  accept="image/*,application/pdf"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {vd?.insurance_document?.secure_url && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Current Insurance Doc:
                    </p>
                    <img
                      src={vd.insurance_document.secure_url}
                      alt="Insurance"
                      className="h-16 w-auto rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Road Tax Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Road Tax Number
                </label>
                <input
                  name="road_tax_number"
                  type="text"
                  defaultValue={vd?.road_tax_number || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Road tax number"
                />
              </div>

              {/* Road Tax Expiry */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Road Tax Expiry
                </label>
                <input
                  name="road_tax_expiry"
                  type="date"
                  defaultValue={
                    vd?.road_tax_expiry
                      ? new Date(vd.road_tax_expiry).toISOString().split("T")[0]
                      : ""
                  }
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Road Tax Document + preview */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Upload Road Tax Document
                </label>
                <input
                  name="road_tax_document"
                  type="file"
                  accept="image/*,application/pdf"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {vd?.road_tax_document?.secure_url && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Current Road Tax Doc:
                    </p>
                    <img
                      src={vd.road_tax_document.secure_url}
                      alt="Road Tax"
                      className="h-16 w-auto rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Pollution Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Pollution Number
                </label>
                <input
                  name="pollution_number"
                  type="text"
                  defaultValue={vd?.pollution_number || ""}
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="PUC number"
                />
              </div>

              {/* Pollution Expiry */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Pollution Expiry
                </label>
                <input
                  name="pollution_expiry"
                  type="date"
                  defaultValue={
                    vd?.pollution_expiry
                      ? new Date(vd.pollution_expiry)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Pollution Document + preview */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Upload Pollution Document
                </label>
                <input
                  name="pollution_document"
                  type="file"
                  accept="image/*,application/pdf"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {vd?.pollution_document?.secure_url && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Current Pollution Doc:
                    </p>
                    <img
                      src={vd.pollution_document.secure_url}
                      alt="Pollution"
                      className="h-16 w-auto rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========== SUBMIT ========== */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? selectedDriver
                ? "Updating..."
                : "Saving..."
              : selectedDriver
                ? "Update Driver"
                : "Add Driver"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAndEditDriver;
