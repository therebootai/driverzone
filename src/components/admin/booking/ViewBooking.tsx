"use client";
import React from "react";
import { BookingTypes } from "@/types/types";
import SidePopup from "@/ui/SidePopup";
import Field from "@/ui/Field";
import dayjs from "dayjs";
import Link from "next/link";
import { IconType } from "react-icons";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineUserPlus,
  HiOutlineHandThumbUp,
  HiOutlineMapPin,
  HiOutlineRocketLaunch,
  HiOutlineFlag,
  HiOutlineXCircle,
} from "react-icons/hi2";

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

  const statusSteps: { key: string; label: string; timestamp?: Date; icon: IconType }[] = [
    { key: "pending", label: "Pending", timestamp: booking.createdAt, icon: HiOutlineClipboardDocumentList },
    { key: "assigned", label: "Driver Assigned", timestamp: booking.assignedAt, icon: HiOutlineUserPlus },
    { key: "accepted", label: "Accepted by Driver", timestamp: booking.acceptedAt, icon: HiOutlineHandThumbUp },
    { key: "arrived", label: "Driver Arrived", timestamp: booking.arrivedAt, icon: HiOutlineMapPin },
    { key: "started", label: "Trip Started", timestamp: booking.startedAt, icon: HiOutlineRocketLaunch },
    { key: "completed", label: "Completed", timestamp: booking.completedAt, icon: HiOutlineFlag },
  ];

  const cancelledStep = { key: "cancelled", label: "Cancelled", timestamp: booking.cancelledAt, icon: HiOutlineXCircle };

  const isCancelled = booking.status === "cancelled";

  // Build final steps list: if cancelled, show steps up to cancellation then the cancelled step
  const activeSteps = isCancelled
    ? [
        ...statusSteps.slice(
          0,
          statusSteps.findIndex((s) => s.key === booking.status) + 1,
        ).length > 0
          ? statusSteps.slice(
              0,
              statusSteps.findIndex((s) => s.key === booking.status),
            )
          : [],
        cancelledStep,
      ]
    : statusSteps;

  const currentIdx = activeSteps.findIndex((s) => s.key === booking.status);

  const formatTimestamp = (date?: Date) => {
    if (!date) return null;
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

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
            <Field
              label="Booking Date"
              value={dayjs(booking.createdAt).format("DD MMM YYYY, hh:mm A")}
            />
            <Field label="Status" value={getStatusBadge(booking.status)} />
            <Field
              label="Trip Type"
              value={
                booking.tripType?.replace(/-/g, " ")?.toUpperCase() || "N/A"
              }
            />
            <Field
              label="Distance / Duration"
              value={`${booking.distance || 0} km / ${
                booking.duration
                  ? `${booking.duration} hours`
                  : booking.package_type?.duration
                    ? `${booking.package_type.duration} hrs`
                    : "0 mins"
              }`}
            />
            <Field label="Vehicle Type" value={booking.vehicleType || "N/A"} />
            <Field label="Insurance" value={booking.insurance ? "Yes" : "No"} />
            {booking.schedule_date && (
              <Field
                label="Schedule Time"
                value={`${dayjs(booking.schedule_date).format("DD MMM YYYY")} at ${booking.schedule_time}`}
              />
            )}
            {booking.cancelReason && (
              <Field label="Cancel Reason" value={booking.cancelReason} />
            )}
          </div>
        </div>

        {/* Booking Timeline */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">
            Booking Timeline
          </h3>
          <div className="flex flex-col">
            {activeSteps.map((step, idx) => {
              const isReached = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const isLast = idx === activeSteps.length - 1;

              const dotColor = isCurrent
                ? "bg-blue-500 ring-4 ring-blue-100"
                : isReached
                  ? step.key === "cancelled"
                    ? "bg-red-500"
                    : "bg-green-500"
                  : "bg-gray-300";

              const lineColor = isReached
                ? step.key === "cancelled"
                  ? "bg-red-300"
                  : "bg-green-300"
                : "bg-gray-200";

              const textColor = isReached
                ? "text-gray-900"
                : "text-gray-400";

              return (
                <div key={step.key} className="flex items-start gap-3">
                  {/* Dot + Line column */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} />
                    {!isLast && (
                      <div className={`w-0.5 min-h-[2rem] flex-1 ${lineColor}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium flex items-center gap-1.5 ${textColor}`}>
                        <step.icon className="w-4 h-4" />
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                          Current
                        </span>
                      )}
                    </div>
                    {isReached && step.timestamp ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatTimestamp(step.timestamp as unknown as Date)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5 italic">
                        {isReached ? "Timestamp not recorded" : "Pending"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Locations
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Pickup Address"
              value={booking.pickupAddress || "-"}
            />
            {booking.tripType === "round-trip" && (
              <Field
                label="Stop Address (Via)"
                value={booking.stopAddress || "Not specified"}
              />
            )}
            <Field
              label={booking.tripType === "round-trip" ? "Return Address" : "Drop Address"}
              value={booking.dropAddress || "-"}
            />
          </div>
        </div>

        {/* Customer & Driver Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
              Customer Info
            </h3>
            <div className="flex flex-col gap-3">
              <Field
                label="Name"
                value={
                  <Link
                    href={`/admin/customer-management?view=${booking.customerDetails?._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {booking.customerDetails?.name || "-"}
                  </Link>
                }
              />
              <Field
                label="Phone"
                value={booking.customerDetails?.mobile_number || "-"}
              />
              <Field
                label="Email"
                value={booking.customerDetails?.email || "-"}
              />
              {booking.customerRating !== undefined && (
                <Field
                  label="Given Rating"
                  value={`${booking.customerRating} ⭐`}
                />
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
              Driver Info
            </h3>
            <div className="flex flex-col gap-3">
              <Field
                label="Name"
                value={
                  booking.driverDetails ? (
                    <Link
                      href={`/admin/driver-management?view=${booking.driverDetails._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.driverDetails.driver_name}
                    </Link>
                  ) : (
                    "Unassigned"
                  )
                }
              />
              {booking.driverDetails && (
                <>
                  <Field
                    label="Phone"
                    value={booking.driverDetails.mobile_number || "-"}
                  />
                  <Field
                    label="Vehicle Number"
                    value={booking.driverDetails.vehicle_number || "-"}
                  />
                  {booking.driverRating !== undefined && (
                    <Field
                      label="Given Rating"
                      value={`${booking.driverRating} ⭐`}
                    />
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
            <Field
              label="Payment Status"
              value={getPaymentStatusBadge(booking.paymentStatus)}
            />
            {booking.paymentMethod && (
              <Field
                label="Payment Method"
                value={booking.paymentMethod?.toUpperCase()}
              />
            )}
            {booking.fare > 0 && (
              <Field
                label="Total Fare"
                value={`₹${booking.fare?.toLocaleString("en-IN")}`}
              />
            )}
            {booking.paid_amount && booking.paid_amount > 0 ? (
              <Field
                label="Paid Amount"
                value={`₹${booking.paid_amount?.toLocaleString("en-IN")}`}
              />
            ) : null}

            {booking.fare_details && (
              <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 border-t pt-3">
                {booking.fare_details.company_charge &&
                booking.fare_details.company_charge > 0 ? (
                  <Field
                    label="Company Charge"
                    value={`₹${booking.fare_details.company_charge}`}
                  />
                ) : null}
                {booking.fare_details.driver_charge &&
                booking.fare_details.driver_charge > 0 ? (
                  <Field
                    label="Driver Charge (Earning)"
                    value={`₹${booking.fare_details.driver_charge}`}
                  />
                ) : null}
                {booking.fare_details.fooding_charge &&
                booking.fare_details.fooding_charge > 0 ? (
                  <Field
                    label="Fooding Charge"
                    value={`₹${booking.fare_details.fooding_charge}`}
                  />
                ) : null}
                {booking.fare_details.early_morning_charge &&
                booking.fare_details.early_morning_charge > 0 ? (
                  <Field
                    label="Early Morning Charge"
                    value={`₹${booking.fare_details.early_morning_charge}`}
                  />
                ) : null}
                {booking.fare_details.late_night_charge &&
                booking.fare_details.late_night_charge > 0 ? (
                  <Field
                    label="Late Night Charge"
                    value={`₹${booking.fare_details.late_night_charge}`}
                  />
                ) : null}
                {booking.fare_details.service_booking_charge &&
                booking.fare_details.service_booking_charge > 0 ? (
                  <Field
                    label="Service Booking Charge"
                    value={`₹${booking.fare_details.service_booking_charge}`}
                  />
                ) : null}
                {booking.fare_details.insurance_charge &&
                booking.fare_details.insurance_charge > 0 ? (
                  <Field
                    label="Insurance Charge"
                    value={`₹${booking.fare_details.insurance_charge}`}
                  />
                ) : null}
                {booking.fare_details.discount &&
                booking.fare_details.discount > 0 ? (
                  <Field
                    label="Package Discount"
                    value={`-₹${booking.fare_details.discount}`}
                  />
                ) : null}
                {booking.fare_details.over_time_customer_charge &&
                booking.fare_details.over_time_customer_charge > 0 ? (
                  <Field
                    label="Overtime Charge (+Fare)"
                    value={`₹${booking.fare_details.over_time_customer_charge}`}
                  />
                ) : null}
                {booking.fare_details.over_time_driver_charge &&
                booking.fare_details.over_time_driver_charge > 0 ? (
                  <Field
                    label="Late Arrival Fine (-Driver)"
                    value={`-₹${booking.fare_details.over_time_driver_charge}`}
                  />
                ) : null}
              </div>
            )}

            {booking.package_type && (
              <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 border-t pt-3">
                <Field label="Package Name" value={booking.package_type.name} />
                {(booking.package_type.price ||
                  (booking.package_type as any).total_price) > 0 && (
                  <Field
                    label="Package Price"
                    value={`₹${(booking.package_type.price || (booking.package_type as any).total_price)?.toLocaleString("en-IN")}`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {(booking as any).refundInitiated && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
              Refund Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Refund Status"
                value={
                  (booking as any).refundStatus === "completed" ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Refunded
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  )
                }
              />
              {(booking as any).refundCompletedAt && (
                <Field
                  label="Refunded On"
                  value={dayjs((booking as any).refundCompletedAt).format("DD MMM YYYY, hh:mm A")}
                />
              )}
            </div>
          </div>
        )}

        {/* OTP & Security */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
            Security & Verification
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="OTP Sent" value={booking.otp || "-"} />
            <Field
              label="OTP Verified"
              value={booking.otp_verified ? "Yes ✅" : "No ❌"}
            />
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
