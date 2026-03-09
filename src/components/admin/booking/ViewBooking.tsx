"use client";
import React from "react";
import { BookingTypes } from "@/types/types";
import SidePopup from "@/ui/SidePopup";
import Field from "@/ui/Field";
import dayjs from "dayjs";

interface ViewBookingProps {
  booking: BookingTypes | null;
  showPopUp: boolean;
  onClose: () => void;
}

const ViewBooking: React.FC<ViewBookingProps> = ({
  booking,
  showPopUp,
  onClose,
}) => {
  if (!booking) return null;

  // Helpers for badges (copied/adapted from ManageBooking)
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      accepted: "bg-indigo-100 text-indigo-800",
      arrived: "bg-purple-100 text-purple-800",
      started: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const statusText: Record<string, string> = {
      pending: "Pending",
      assigned: "Driver Assigned",
      accepted: "Accepted by Driver",
      arrived: "Driver Arrived",
      started: "Trip Started",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[status] || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <SidePopup
      showPopUp={showPopUp}
      handleClose={onClose}
      clsprops="px-6 max-w-3xl"
    >
      <h1 className="text-2xl font-semibold text-site-black mb-2">
        Booking Details
      </h1>
      <p className="text-gray-600 text-sm mb-6">ID: {booking.booking_id}</p>

      <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-2 pb-6">
        {/* Core Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Trip Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Booking Date" value={dayjs(booking.createdAt).format("DD MMM YYYY, hh:mm A")} />
            <Field label="Status" value={getStatusBadge(booking.status)} />
            <Field label="Trip Type" value={booking.tripType?.replace(/-/g, " ")?.toUpperCase() || "N/A"} />
            <Field label="Distance / Duration" value={`${booking.distance || 0} km / ${booking.duration || 0} mins`} />
            <Field label="Vehicle Type" value={booking.vehicleType || "N/A"} />
            <Field label="Insurance" value={booking.insurance ? "Yes" : "No"} />
            {booking.schedule_date && (
                <Field label="Schedule Time" value={`${dayjs(booking.schedule_date).format("DD MMM YYYY")} at ${booking.schedule_time}`} />
            )}
            {booking.cancelReason && (
                 <Field label="Cancel Reason" value={booking.cancelReason} />
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Locations
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Pickup Address" value={booking.pickupAddress || "-"} />
            <Field label="Drop Address" value={booking.dropAddress || "-"} />
          </div>
        </div>

        {/* Customer & Driver Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
              Customer Info
            </h3>
            <div className="flex flex-col gap-3">
              <Field label="Name" value={booking.customerDetails?.name || "-"} />
              <Field label="Phone" value={booking.customerDetails?.mobile_number || "-"} />
              <Field label="Email" value={booking.customerDetails?.email || "-"} />
              {booking.customerRating !== undefined && (
                <Field label="Given Rating" value={`${booking.customerRating} ⭐`} />
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
              Driver Info
            </h3>
            <div className="flex flex-col gap-3">
              <Field label="Name" value={booking.driverDetails?.driver_name || "Unassigned"} />
              {booking.driverDetails && (
                <>
                  <Field label="Phone" value={booking.driverDetails.mobile_number || "-"} />
                  <Field label="Vehicle Number" value={booking.driverDetails.vehicle_number || "-"} />
                  {booking.driverRating !== undefined && (
                    <Field label="Given Rating" value={`${booking.driverRating} ⭐`} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment & Fare Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Payment & Fare Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Status" value={getPaymentStatusBadge(booking.paymentStatus)} />
            <Field label="Payment Method" value={booking.paymentMethod?.toUpperCase()} />
            <Field label="Estimated Fare" value={`₹${booking.estimatedFare?.toLocaleString("en-IN") || "0"}`} />
            <Field label="Total Fare" value={`₹${booking.fare?.toLocaleString("en-IN") || "0"}`} />
            
            {booking.fare_details && (
              <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 border-t pt-3">
                <Field label="Company Charge" value={`₹${booking.fare_details.company_charge || 0}`} />
                <Field label="Driver Charge" value={`₹${booking.fare_details.driver_charge || 0}`} />
                <Field label="Fooding Charge" value={`₹${booking.fare_details.fooding_charge || 0}`} />
                <Field label="Early/Late Charge" value={`₹${(booking.fare_details.early_morning_charge || 0) + (booking.fare_details.late_night_charge || 0)}`} />
              </div>
            )}
            
            {booking.package_type && (
                <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 border-t pt-3">
                   <Field label="Package Name" value={booking.package_type.name} />
                   <Field label="Package Price" value={`₹${booking.package_type.price}`} />
                </div>
            )}

          </div>
        </div>

        {/* OTP & Security */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Security & Verification
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="OTP Sent" value={booking.otp || "-"} />
            <Field label="OTP Verified" value={booking.otp_verified ? "Yes ✅" : "No ❌"} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-blue-600 font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Close Details
        </button>
      </div>
    </SidePopup>
  );
};

export default ViewBooking;
