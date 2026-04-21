"use client";

import { DELETE_PACKAGE, UPDATE_PACKAGE } from "@/actions/packageAction";
import { PackageDocument } from "@/models/Packages";
import Field from "@/ui/Field";
import SidePopup from "@/ui/SidePopup";
import TableComponent from "@/ui/TableComponent";
import { convertTime } from "@/utils/timeConversion";
import { useState } from "react";
import toast from "react-hot-toast";
import PackageForm from "./PackageForm";

export default function PackageTable({
  allPackages,
}: {
  allPackages: PackageDocument[];
}) {
  const [selectedPackage, setSelectedPackage] =
    useState<PackageDocument | null>();

  const [sidePopupVisible, setSidePopupVisible] = useState<"view" | "edit">(
    "view",
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;
    try {
      await DELETE_PACKAGE(id);
      toast.success("Package deleted successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleStatus = async (id: string, status: boolean) => {
    try {
      await UPDATE_PACKAGE(id, { status });
      toast.success("Package status updated successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <>
      <section className="flex flex-col gap-5">
        <h1 className="font-semibold lg:text-xl text-lg text-site-black">
          Manage Packages
        </h1>
        <TableComponent
          TABLE_HEAD={[
            "Name",
            "Destination",
            "Duration",
            "Package Type",
            "Company Charge",
            "Driver Charge",
            "Created",
            "Status",
            "Actions",
          ]}
          TABLE_ROWS={allPackages.map((item) => (
            <tr key={item.package_id} className="even:bg-neutral-50">
              <td className="py-2 px-2.5">{item.name || ""}</td>
              <td className="py-2 px-2.5">{item.destination || ""}</td>
              <td className="py-2 px-2.5">
                {convertTime(item.duration).value}{" "}
                {convertTime(item.duration).unit}
              </td>
              <td className="py-2 px-2.5">
                {item.package_type.replaceAll("_", " ")}
              </td>
              <td className="py-2 px-2.5">{item.company_charge || ""}</td>
              <td className="py-2 px-2.5">{item.driver_charge || ""}</td>
              <td className="py-2 px-2.5">
                {new Date(item.createdAt || "").toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td className="py-2 px-2.5">
                <button
                  className={
                    "px-3 rounded-sm flex justify-center items-center transition-colors duration-700 cursor-pointer " +
                    (item.status
                      ? "bg-[#DCFCE7] text-[#006924] hover:bg-[#006924] hover:text-white"
                      : "bg-[#FEE2E2] text-[#910000] hover:bg-[#910000] hover:text-white")
                  }
                  onClick={() => handleStatus(item._id as string, !item.status)}
                >
                  {item.status ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="flex flex-row gap-2 py-2 px-2.5">
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    setSidePopupVisible("view");
                    setSelectedPackage(item);
                  }}
                >
                  View
                </button>{" "}
                |
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    setSidePopupVisible("edit");
                    setSelectedPackage(item);
                  }}
                >
                  Edit
                </button>{" "}
                |
                <button
                  className="cursor-pointer"
                  type="button"
                  onClick={() => handleDelete(item._id as string)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        />
      </section>
      <SidePopup
        showPopUp={!!selectedPackage}
        handleClose={() => setSelectedPackage(null)}
        clsprops="px-6"
      >
        {sidePopupVisible === "view" ? (
          <>
            <h1 className="text-2xl font-semibold text-site-black">
              Package Details
            </h1>
            <div className="flex flex-col gap-2.5 mt-4">
              <Field label="Package ID" value={selectedPackage?.package_id} />
              <Field label="Name" value={selectedPackage?.name} />

              <Field
                label="Package Type"
                value={
                  selectedPackage?.package_type
                    ? selectedPackage?.package_type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    : "-"
                }
              />

              <Field
                label="Duration"
                value={
                  selectedPackage?.duration
                    ? `${selectedPackage?.duration} hours`
                    : "-"
                }
              />

              <Field label="Destination" value={selectedPackage?.destination} />

              <div className="border-t border-gray-200 pt-2 mt-2">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Pricing Details
                </h2>

                <Field
                  label="Company Charge"
                  value={
                    selectedPackage?.company_charge
                      ? `₹${selectedPackage?.company_charge.toLocaleString(
                          "en-IN",
                        )}`
                      : "-"
                  }
                />

                <Field
                  label="Driver Charge"
                  value={
                    selectedPackage?.driver_charge
                      ? `₹${selectedPackage?.driver_charge.toLocaleString(
                          "en-IN",
                        )}`
                      : "-"
                  }
                />

                <Field
                  label="Total Price"
                  value={
                    selectedPackage?.total_price
                      ? `₹${selectedPackage?.total_price.toLocaleString(
                          "en-IN",
                        )}`
                      : "-"
                  }
                />

                {selectedPackage?.fooding_charge !== undefined && (
                  <Field
                    label="Fooding Charge"
                    value={`₹${selectedPackage?.fooding_charge.toLocaleString(
                      "en-IN",
                    )}`}
                  />
                )}

                {selectedPackage?.early_morning_charge !== undefined && (
                  <Field
                    label="Early Morning Charge"
                    value={`₹${selectedPackage?.early_morning_charge.toLocaleString(
                      "en-IN",
                    )}`}
                  />
                )}

                {selectedPackage?.late_night_charge !== undefined && (
                  <Field
                    label="Late Night Charge"
                    value={`₹${selectedPackage?.late_night_charge.toLocaleString(
                      "en-IN",
                    )}`}
                  />
                )}

                {selectedPackage?.service_booking_charge !== undefined && (
                  <Field
                    label="Service Booking Charge"
                    value={`₹${selectedPackage?.service_booking_charge.toLocaleString(
                      "en-IN",
                    )}`}
                  />
                )}
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Overtime Charges
                </h2>

                <Field
                  label="Customer Overtime Charge"
                  value={
                    selectedPackage?.over_time_customer_charge
                      ? `₹${selectedPackage?.over_time_customer_charge.toLocaleString(
                          "en-IN",
                        )}/min`
                      : "-"
                  }
                />

                <Field
                  label="Driver Overtime Charge"
                  value={
                    selectedPackage?.over_time_driver_charge
                      ? `₹${selectedPackage?.over_time_driver_charge.toLocaleString(
                          "en-IN",
                        )}/min`
                      : "-"
                  }
                />
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Service Areas
                </h2>
                <Field
                  label="Free Serviceable Area"
                  value={selectedPackage?.main_zone?.name || "All Zones"}
                />
                <Field
                  label="Chargeable Service Area"
                  value={selectedPackage?.service_zone?.name || "None"}
                />
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Discount Details
                </h2>

                <Field
                  label="Discount Type"
                  value={
                    selectedPackage?.discount_type
                      ? selectedPackage?.discount_type
                          .charAt(0)
                          .toUpperCase() +
                        selectedPackage?.discount_type.slice(1)
                      : "None"
                  }
                />

                {selectedPackage?.discount_type !== "none" && (
                  <Field
                    label="Discount Value"
                    value={
                      selectedPackage?.discount_type === "percentage"
                        ? `${selectedPackage?.discount}%`
                        : `₹${selectedPackage?.discount?.toLocaleString(
                            "en-IN",
                          )}`
                    }
                  />
                )}
              </div>

              <Field
                label="Status"
                value={
                  selectedPackage?.status ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-red-600 font-medium">Inactive</span>
                  )
                }
              />

              {/* <Field
                label="Created At"
                value={
                  selectedPackage?.createdAt
                    ? new Date(selectedPackage?.createdAt).toLocaleString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "-"
                }
              />

              <Field
                label="Last Updated"
                value={
                  selectedPackage?.updatedAt
                    ? new Date(selectedPackage?.updatedAt).toLocaleString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "-"
                }
              /> */}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-site-black">
              Update Package
            </h1>
            <PackageForm
              update_package={selectedPackage ?? undefined}
              onClose={() => setSelectedPackage(null)}
            />
          </>
        )}
      </SidePopup>
    </>
  );
}
