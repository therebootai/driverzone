"use client";

import Image from "next/image";
import { DriverDocument, BookingTypes } from "@/types/types";
import Link from "next/link";
import Field from "@/ui/Field";
import { useEffect, useState } from "react";
import { getBookings } from "@/actions/bookingAction";

const FilePreview = ({
  file,
  onImageClick,
}: {
  file: any;
  onImageClick?: (url: string) => void;
}) => {
  if (!file?.secure_url)
    return <p className="text-xs text-gray-300">No file uploaded.</p>;

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
        <div
          className="cursor-pointer group relative overflow-hidden rounded-md border"
          onClick={() => onImageClick?.(file.secure_url)}
        >
          <Image
            src={file.secure_url}
            alt="Preview"
            width={800}
            height={600}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
              Click to enlarge
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewDriver = ({ 
  driver,
  onImageClick,
  hideBookings = false
}: { 
  driver: DriverDocument;
  onImageClick?: (url: string) => void;
  hideBookings?: boolean;
}) => {
  const vd = driver.vehicle_details;

  const [bookings, setBookings] = useState<BookingTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchBookings = async (pageNum: number, isInitial = false) => {
    if (!driver._id) return;

    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getBookings({
        driverId: driver._id.toString(),
        page: pageNum,
        limit: 12,
      });

      if (res.success) {
        if (isInitial) {
          setBookings(res.data);
        } else {
          setBookings((prev: BookingTypes[]) => [...prev, ...res.data]);
        }
        setHasNextPage(res.paginations.hasNextPage);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBookings(1, true);
  }, [driver._id]);

  useEffect(() => {
    if (page > 1) {
      fetchBookings(page);
    }
  }, [page]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || !hasNextPage || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          setPage((prev: number) => prev + 1);
        }
      },
      { threshold: 1.0 },
    );

    const target = document.getElementById("scroll-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [loading, hasNextPage, loadingMore]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "started":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "accepted":
      case "assigned":
      case "arrived":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-5 w-full">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Driver Details</h1>

      {/* ========== DRIVER BASIC INFO ========== */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Driver Name" value={driver.driver_name} />
          <Field label="Mobile Number" value={driver.mobile_number} />
          <Field label="Total Rides" value={driver.total_rides || 0} />
          <Field label="Total Earnings" value={driver.total_earnings || 0} />
          <Field label="Average Rating" value={driver.rating || "0.0"} />
          <Field label="Emergency Number" value={driver.emergency_number} />
          <Field label="City / Area" value={driver.city_area} />
          <Field label="Address" value={driver.address} />
          <Field label="Landmark" value={driver.landmark} />
          <Field label="Pin Code" value={driver.pin_code} />
          <Field label="Employment Type" value={driver.employment_type} />
          <Field
            label="Speciality"
            value={
              Array.isArray(driver.speciality)
                ? driver.speciality
                    ?.map((s) =>
                      s
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")
                    )
                    .join(", ")
                : driver.speciality
            }
          />
          <Field
            label="Vehicle Transmission Type"
            value={
              Array.isArray(driver.vehicle_transmission_type)
                ? driver.vehicle_transmission_type.join(", ")
                : driver.vehicle_transmission_type
            }
          />
          <Field
            label="Vehicle Category Type"
            value={
              Array.isArray(driver.vehicle_category_type)
                ? driver.vehicle_category_type.join(", ")
                : driver.vehicle_category_type
            }
          />
          <Field label="Remarks" value={driver.remarks} />
          <Field
            label="Verified"
            value={
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  driver.verified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {driver.verified ? "Verified" : "Unverified"}
              </span>
            }
          />
          <Field
            label="Status"
            value={
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  driver.status
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {driver.status ? "Active" : "Inactive"}
              </span>
            }
          />
          <Field
            label="Is Online"
            value={
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  driver.isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {driver.isOnline ? "Online" : "Offline"}
              </span>
            }
          />
          {driver.isOnline && driver.currentLocation && (
            <Field
              label="Current Location"
              value={
                <a
                  href={`https://maps.google.com/?q=${driver.currentLocation.lat},${driver.currentLocation.lng}`}
                  target="_blank"
                  className="text-blue-600 underline font-medium"
                >
                  View on Google Maps
                </a>
              }
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* ========== IDENTITY INFO ========== */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Identity Information
          </h2>
          {(driver.identity_documents && driver.identity_documents.length > 0
            ? driver.identity_documents
            : driver.identity_id_type
              ? [{ identity_id_type: driver.identity_id_type, identity_id_number: driver.identity_id_number, identity_id_proof_img_1: (driver as any).identity_id_proof_url, identity_id_proof_img_2: undefined }]
              : []
          ).map((doc, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Document {idx + 1}
                </span>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Identity Type" value={doc.identity_id_type} />
                  <Field
                    label="Identity Number"
                    value={doc.identity_id_number}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Front Image
                    </span>
                    <FilePreview 
                      file={doc.identity_id_proof_img_1} 
                      onImageClick={onImageClick}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Back Image
                    </span>
                    <FilePreview 
                      file={doc.identity_id_proof_img_2} 
                      onImageClick={onImageClick}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========== LICENSE INFO ========== */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Licence Information
          </h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-6">
                <Field label="Licence Number" value={driver.licence_no} />
                <Field
                  label="Licence Expiry"
                  value={
                    driver.licence_expiry_date
                      ? new Date(driver.licence_expiry_date).toLocaleDateString()
                      : "-"
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Licence (Front)
                  </span>
                  <FilePreview 
                    file={(driver as any).licence_file_img_1} 
                    onImageClick={onImageClick}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Licence (Back)
                  </span>
                  <FilePreview 
                    file={(driver as any).licence_file_img_2} 
                    onImageClick={onImageClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* ========== PS NOC INFO ========== */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Police Station NOC
          </h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  PS NOC Document
                </span>
                <FilePreview 
                  file={driver.ps_noc} 
                  onImageClick={onImageClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ========== VEHICLE DETAILS ========== */}
      {driver.employment_type === "Driver+Car" && vd && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Vehicle Details
          </h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Car Name" value={vd.car_name} />
              <Field
                label="Model Name & Number"
                value={vd.model_name_and_number}
              />
              <Field label="Car Number" value={vd.car_number} />
              <Field label="Registration Number" value={vd.reg_number} />
              <Field label="Description" value={vd.desc} />
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Car Images & RC
              </h3>
              <div className="flex flex-wrap gap-4">
                {vd.car_images_and_rc && vd.car_images_and_rc.length > 0 ? (
                  vd.car_images_and_rc.map((img, index) => (
                    <div
                      key={index}
                      className="group relative border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onImageClick?.(img.secure_url)}
                    >
                      <Image
                        src={img.secure_url}
                        alt="car image"
                        width={180}
                        height={120}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        View Full
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No car images uploaded.
                  </p>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Insurance & Documents
          </h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Insurance
              </h3>
              <Field label="Insurance Number" value={vd.insurance_number} />
              <Field
                label="Insurance Expiry"
                value={
                  vd.insurance_expiry
                    ? new Date(vd.insurance_expiry).toLocaleDateString()
                    : "-"
                }
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-700">
                  Document Preview
                </span>
                <FilePreview 
                  file={vd.insurance_document} 
                  onImageClick={onImageClick}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-l border-gray-100 pl-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Road Tax
              </h3>
              <Field label="Road Tax Number" value={vd.road_tax_number} />
              <Field
                label="Road Tax Expiry"
                value={
                  vd.road_tax_expiry
                    ? new Date(vd.road_tax_expiry).toLocaleDateString()
                    : "-"
                }
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-700">
                  Document Preview
                </span>
                <FilePreview 
                  file={vd.road_tax_document} 
                  onImageClick={onImageClick}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-l border-gray-100 pl-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pollution (PUC)
              </h3>
              <Field label="Pollution Number" value={vd.pollution_number} />
              <Field
                label="Pollution Expiry"
                value={
                  vd.pollution_expiry
                    ? new Date(vd.pollution_expiry).toLocaleDateString()
                    : "-"
                }
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-700">
                  Document Preview
                </span>
                <FilePreview 
                  file={vd.pollution_document} 
                  onImageClick={onImageClick}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== DRIVER BOOKINGS ========== */}
      {!hideBookings && (
        <div className="mt-8 border-t pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Bookings
          </h2>

          {loading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
              <svg
                className="animate-spin -ml-1 mr-3 h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-500 font-medium">
                Loading bookings...
              </span>
            </div>
          ) : bookings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((booking: BookingTypes) => (
                  <Link
                    key={booking._id}
                    href={`/admin/booking-management?view=${booking._id}`}
                    className="group block bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-400 group-hover:text-primary transition-colors">
                          ID: {booking._id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                          {booking.tripType} - ₹{booking.fare}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Scroll Trigger */}
              <div id="scroll-trigger" className="h-10 w-full" />

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center py-6">
                  <svg
                    className="animate-spin h-5 w-5 text-primary mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-500 text-sm font-medium">
                    Loading more...
                  </span>
                </div>
              )}

              {!hasNextPage && bookings.length > 5 && (
                <div className="text-center py-8 text-gray-400 text-xs italic">
                  You've reached the end of the list
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No bookings found for this driver.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewDriver;
