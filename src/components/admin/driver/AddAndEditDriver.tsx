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

  const [identityDocs, setIdentityDocs] = useState<
    { identity_id_type: string; identity_id_number: string; file1?: File; file2?: File }[]
  >(
    selectedDriver?.identity_documents?.length
      ? selectedDriver.identity_documents.map((doc) => ({
          identity_id_type: doc.identity_id_type || "",
          identity_id_number: doc.identity_id_number || "",
        }))
      : [{ identity_id_type: "", identity_id_number: "" }],
  );

  const addIdentityDoc = () => {
    setIdentityDocs((prev) => [
      ...prev,
      { identity_id_type: "", identity_id_number: "" },
    ]);
  };

  const removeIdentityDoc = (index: number) => {
    setIdentityDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIdentityDoc = (
    index: number,
    field: "identity_id_type" | "identity_id_number",
    value: string,
  ) => {
    setIdentityDocs((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc)),
    );
  };

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

          {/* Identity Documents (multiple) */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Identity Documents
              </label>
              <button
                type="button"
                onClick={addIdentityDoc}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                + Add More
              </button>
            </div>
            {identityDocs.map((doc, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    ID Type
                  </label>
                  <select
                    value={doc.identity_id_type}
                    onChange={(e) =>
                      updateIdentityDoc(index, "identity_id_type", e.target.value)
                    }
                    name={`identity_id_type_${index}`}
                    className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="aadhar">Aadhaar</option>
                    <option value="pan">PAN</option>
                    <option value="voter">Voter ID</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={doc.identity_id_number}
                    onChange={(e) =>
                      updateIdentityDoc(index, "identity_id_number", e.target.value)
                    }
                    name={`identity_id_number_${index}`}
                    className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter ID number"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    Front Image
                  </label>
                  <input
                    name={`identity_id_proof_img_1_${index}`}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIdentityDocs((prev) =>
                          prev.map((d, i) =>
                            i === index ? { ...d, file1: file } : d,
                          ),
                        );
                      }
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {selectedDriver?.identity_documents?.[index]
                    ?.identity_id_proof_img_1?.secure_url && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">Current Front:</p>
                      <img
                        src={selectedDriver.identity_documents[index].identity_id_proof_img_1!.secure_url}
                        alt={`Front ${index + 1}`}
                        className="h-16 w-auto rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    Back Image
                  </label>
                  <input
                    name={`identity_id_proof_img_2_${index}`}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIdentityDocs((prev) =>
                          prev.map((d, i) =>
                            i === index ? { ...d, file2: file } : d,
                          ),
                        );
                      }
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {selectedDriver?.identity_documents?.[index]
                    ?.identity_id_proof_img_2?.secure_url && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">Current Back:</p>
                      <img
                        src={selectedDriver.identity_documents[index].identity_id_proof_img_2!.secure_url}
                        alt={`Back ${index + 1}`}
                        className="h-16 w-auto rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-end">
                  {identityDocs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIdentityDoc(index)}
                      className="text-xs font-medium text-red-500 hover:text-red-700 pb-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
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

          {/* Upload Licence Front */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Upload Licence (Front)
            </label>
            <input
              name="licence_file_img_1"
              type="file"
              accept="image/*,application/pdf"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {selectedDriver?.licence_file_img_1?.secure_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Current Front:</p>
                <img
                  src={selectedDriver.licence_file_img_1.secure_url}
                  alt="Licence Front"
                  className="h-20 w-auto rounded border"
                />
              </div>
            )}
          </div>

          {/* Upload Licence Back */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Upload Licence (Back)
            </label>
            <input
              name="licence_file_img_2"
              type="file"
              accept="image/*,application/pdf"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {selectedDriver?.licence_file_img_2?.secure_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Current Back:</p>
                <img
                  src={selectedDriver.licence_file_img_2.secure_url}
                  alt="Licence Back"
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

          {/* Speciality (multi-select checkboxes) */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              Speciality
            </span>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {[
                { value: "in_city", label: "In City" },
                { value: "mini_outstation", label: "Mini Outstation" },
                { value: "outstation", label: "Outstation" },
                { value: "hills_tour", label: "Hills Tour" },
                { value: "long_tour", label: "Long Tour" },
                { value: "drop_pickup_service", label: "Drop/Pickup Service" },
              ].map((item) => (
                <label key={item.value} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="speciality"
                    value={item.value}
                    defaultChecked={
                      Array.isArray(selectedDriver?.speciality)
                        ? (selectedDriver.speciality as string[]).includes(item.value)
                        : true
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Vehicle Category Type (checkbox group) */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">
              Vehicle Category Type
            </span>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {["SUV", "Hatchback", "Sedan", "Mini", "Van", "Others"].map((item) => (
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

          {/* Max Distance */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Max Distance (km)
            </label>
            <input
              name="max_distance"
              type="number"
              defaultValue={selectedDriver?.maxDistance ?? 20}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter max distance"
            />
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
