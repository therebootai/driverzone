"use client";
// components/ManageBooking.tsx
import React, { useEffect, useState } from "react";
import { BookingTypes } from "@/types/types";
import dayjs from "dayjs";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import PaginationBox from "@/ui/PaginationBox";
import Field from "@/ui/Field";
import SidePopup from "@/ui/SidePopup";
import {
  checkBookingOTPStatus,
  resendBookingArrivalOTP,
  sendBookingArrivalOTP,
  updateBooking,
  verifyBookingArrivalOTP,
} from "@/actions/bookingAction";
import { getAllDriver } from "@/actions/driverActions";
import ViewBooking from "./ViewBooking";

type UpdateActionType =
  | "assign_driver"
  | "update_status"
  | "verify_otp"
  | "cancel_booking"
  | "complete_booking"
  | "mark_arrived";

const ManageBooking = ({
  allBookings,
  pagination,
  fetchData,
}: {
  allBookings: BookingTypes[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    perPage?: number;
  };
  fetchData: (
    page?: number,
    limit?: number,
    search?: string,
    status?: any,
  ) => void;
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingTypes | null>(
    null,
  );
  const [updateModal, setUpdateModal] = useState<{
    show: boolean;
    action: UpdateActionType;
    bookingId: string | null;
  }>({ show: false, action: "assign_driver", bookingId: null });

  const { getParam, updateFilters } = useQueryParamsAdvanced();
  const viewId = getParam("view");

  useEffect(() => {
    if (viewId && allBookings) {
      const booking = allBookings.find(
        (b) => String(b._id) === viewId || b.booking_id === viewId
      );
      if (booking) {
        setSelectedBooking(booking);
      }
    } else {
      setSelectedBooking(null);
    }
  }, [viewId, allBookings]);

  // Form states
  const [otpInput, setOtpInput] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [cancelReason, setCancelReason] = useState("");

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Driver management states
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [driverPagination, setDriverPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
    perPage: 20,
  });
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  // OTP flow states
  const [otpStep, setOtpStep] = useState<
    "initial" | "sent" | "verifying" | "verified"
  >("initial");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [countdown, setCountdown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState<number>(0);

  // Status flow configuration
  const statusFlow: Record<string, string[]> = {
    pending: ["assigned", "cancelled"],
    assigned: ["accepted", "cancelled"],
    accepted: ["arrived", "cancelled"],
    arrived: ["started", "cancelled"],
    started: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  // Fetch drivers with search and pagination
  const fetchDrivers = async (page = 1, search = "") => {
    setIsLoadingDrivers(true);
    try {
      const result = await getAllDriver({
        page,
        limit: 20,
        searchTerm: search,
        status: true, // Only active drivers
      });

      if (result.success) {
        setAllDrivers(result.data || []);
        setDriverPagination(
          result.paginations || {
            totalPages: 1,
            currentPage: page,
            totalItems: 0,
            perPage: 20,
          },
        );
      } else {
        console.error("Failed to fetch drivers:", result.error);
        setAllDrivers([]);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setAllDrivers([]);
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  // Initial fetch drivers
  useEffect(() => {
    fetchDrivers(1, driverSearchTerm);
  }, []);

  // Countdown effects
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiry]);

  // Helper functions
  const getAvailableStatuses = (booking: BookingTypes | null) => {
    if (!booking) return [];
    return statusFlow[booking.status] || [];
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flowOrder = [
      "pending",
      "assigned",
      "accepted",
      "arrived",
      "started",
      "completed",
    ];
    const currentIndex = flowOrder.indexOf(currentStatus);
    return currentIndex < flowOrder.length - 1
      ? flowOrder[currentIndex + 1]
      : null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle driver search
  const handleDriverSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDriverSearchTerm(value);
    const timeoutId = setTimeout(() => {
      fetchDrivers(1, value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  // Handle driver page change
  const handleDriverPageChange = (page: number) => {
    fetchDrivers(page, driverSearchTerm);
  };

  // Handle update actions
  const handleUpdateAction = async (
    action: UpdateActionType,
    bookingId: string,
  ) => {
    const booking = allBookings.find((b) => b._id === bookingId);

    if (action === "mark_arrived" && booking) {
      // Set customer details
      setCustomerPhone(booking.customerDetails?.mobile_number || "");
      setCustomerName(booking.customerDetails?.name || "");

      // Check OTP status
      setIsLoading(true);
      try {
        const otpStatus = await checkBookingOTPStatus(bookingId);

        if (otpStatus.success) {
          if (otpStatus.hasActiveOTP && !otpStatus.otpVerified) {
            setOtpStep("sent");
            if (otpStatus.otpSentAt) {
              const expiryMinutes = 10; // Default OTP expiry
              const expiryTime =
                new Date(otpStatus.otpSentAt).getTime() + expiryMinutes * 60000;
              const remainingSeconds = Math.max(
                0,
                Math.floor((expiryTime - Date.now()) / 1000),
              );
              setOtpExpiry(remainingSeconds);
            }
          } else {
            setOtpStep("initial");
          }
        }
      } catch (error) {
        console.error("Error checking OTP status:", error);
        setOtpStep("initial");
      } finally {
        setIsLoading(false);
      }

      setUpdateModal({ show: true, action: "mark_arrived", bookingId });
      return;
    }

    // For other actions
    setUpdateModal({ show: true, action, bookingId });
    setOtpStep("initial");
    setOtpExpiry(0);
    setCountdown(0);
    setOtpInput("");
  };

  // Send OTP function
  const handleSendOTP = async () => {
    if (!updateModal.bookingId) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await sendBookingArrivalOTP(updateModal.bookingId);

      if (response.success) {
        setOtpStep("sent");
        setSuccess("OTP sent successfully to customer");
        setCountdown(30);
        setOtpExpiry(10 * 60); // 10 minutes expiry

        fetchData(pagination.currentPage);
      } else {
        setError(response.error || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const handleVerifyOTP = async () => {
    if (!updateModal.bookingId || !otpInput || otpInput.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setOtpStep("verifying");

    try {
      const verificationResponse = await verifyBookingArrivalOTP(
        updateModal.bookingId,
        otpInput,
      );

      if (verificationResponse.success) {
        setOtpStep("verified");
        setSuccess("OTP verified successfully!");

        // Now update booking status
        const updateResponse = await updateBooking(
          updateModal.bookingId,
          {
            status: "arrived",
          },
          {
            validateOtp: true,
          },
        );

        if (updateResponse.success) {
          setSuccess("Driver marked as arrived successfully!");
          setTimeout(() => {
            fetchData(pagination.currentPage);
            resetModal();
          }, 1500);
        } else {
          setError(updateResponse.error || "Failed to update booking status");
          setOtpStep("sent");
        }
      } else {
        setOtpStep("sent");
        setError(verificationResponse.error || "OTP verification failed");
      }
    } catch (err: any) {
      setOtpStep("sent");
      setError(err.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    if (!updateModal.bookingId || countdown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await resendBookingArrivalOTP(updateModal.bookingId);

      if (response.success) {
        setOtpStep("sent");
        setSuccess("OTP resent successfully");
        setCountdown(30);
        setOtpExpiry(10 * 60);
        setOtpInput("");

        fetchData(pagination.currentPage);
      } else {
        setError(response.error || "Failed to resend OTP");
        if (response.waitTime) {
          setCountdown(response.waitTime);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit update for other actions
  const handleSubmitUpdate = async () => {
    if (!updateModal.bookingId) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData: any = {};
      const options: any = {};

      switch (updateModal.action) {
        case "assign_driver":
          if (!selectedDriver) {
            setError("Please select a driver");
            setIsLoading(false);
            return;
          }
          updateData.driverDetails = selectedDriver as any;
          updateData.status = "assigned" as any;
          break;

        case "update_status":
          if (!newStatus) {
            setError("Please select a status");
            setIsLoading(false);
            return;
          }
          updateData.status = newStatus;
          break;

        case "cancel_booking":
          if (!cancelReason) {
            setError("Please enter cancellation reason");
            setIsLoading(false);
            return;
          }
          updateData.status = "cancelled";
          updateData.cancelReason = cancelReason;
          break;

        case "complete_booking":
          updateData.status = "completed";
          break;
      }

      const response = await updateBooking(
        updateModal.bookingId,
        updateData,
        options,
      );

      if (response.success) {
        setSuccess(`${updateModal.action.replace("_", " ")} successful!`);
        setTimeout(() => {
          fetchData(pagination.currentPage);
          resetModal();
        }, 1500);
      } else {
        setError(response.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset modal
  const resetModal = () => {
    setUpdateModal({ show: false, action: "assign_driver", bookingId: null });
    setOtpStep("initial");
    setOtpExpiry(0);
    setCountdown(0);
    setOtpInput("");
    setSelectedDriver("");
    setNewStatus("");
    setCancelReason("");
    setError("");
    setSuccess("");
  };

  // Render action buttons based on booking status
  const renderActionButtons = (booking: BookingTypes) => {
    const actions = [];

    if (booking.status === "pending") {
      actions.push(
        <button
          key="assign"
          onClick={() => handleUpdateAction("assign_driver", booking._id)}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
        >
          Assign Driver
        </button>,
      );
    }

    const nextStatus = getNextStatus(booking.status);
    if (nextStatus) {
      let actionText = "";
      switch (nextStatus) {
        case "assigned":
          actionText = "Assign";
          break;
        case "accepted":
          actionText = "Accept";
          break;
        case "arrived":
          actionText = "Mark Arrived";
          break;
        case "started":
          actionText = "Start Trip";
          break;
        case "completed":
          actionText = "Complete Trip";
          break;
        default:
          break;
      }

      if (actionText) {
        actions.push(
          <button
            key="status"
            onClick={() => {
              if (nextStatus === "arrived") {
                handleUpdateAction("mark_arrived", booking._id);
              } else {
                handleUpdateAction("update_status", booking._id);
              }
            }}
            className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
          >
            {actionText}
          </button>,
        );
      }
    }

    if (!["completed", "cancelled"].includes(booking.status)) {
      actions.push(
        <button
          key="cancel"
          onClick={() => handleUpdateAction("cancel_booking", booking._id)}
          className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
        >
          Cancel
        </button>,
      );
    }

    return actions;
  };

  // Status badge helper
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

  // Payment status badge helper
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

  // Render OTP modal
  const renderArrivalOTPModal = () => {
    return (
      <div className="space-y-4">
        {otpStep === "initial" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Mark Driver as Arrived
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Send OTP to customer for verification
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">
                  Customer Details:
                </p>
                <p className="mt-1 text-sm text-blue-700">{customerName}</p>
                <p className="text-sm text-blue-700">{customerPhone}</p>
                <p className="mt-2 text-xs text-blue-600">
                  OTP will be valid for 10 minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {otpStep === "sent" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">OTP Sent</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter the 6-digit OTP received by customer
              </p>
              {otpExpiry > 0 && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Expires in: {formatTime(otpExpiry)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit OTP
              </label>
              <input
                type="text"
                value={otpInput}
                onChange={(e) =>
                  setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isLoading}
                className={`text-blue-600 hover:text-blue-800 ${
                  countdown > 0 || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => setOtpStep("initial")}
                className="text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {otpStep === "verifying" && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">Verifying OTP...</p>
          </div>
        )}

        {otpStep === "verified" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">OTP Verified!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Updating booking status...
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-site-black">
        Booking Management
      </h1>

      {/* Table */}
      <div className="flex flex-col">
        <div className="w-full flex items-center bg-site-stone p-3 py-4 text-site-black text-sm font-semibold">
          <div className="w-[15%]">Booking ID</div>
          <div className="w-[15%]">Date</div>
          <div className="w-[10%]">Fare</div>
          <div className="w-[10%]">Customer</div>
          <div className="w-[10%]">Driver</div>
          <div className="w-[10%]">Trip Type</div>
          <div className="w-[15%]">Status</div>
          <div className="w-[15%]">Actions</div>
        </div>

        {allBookings.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No bookings found.
          </div>
        ) : (
          allBookings.map((booking) => (
            <div
              key={booking._id}
              className="w-full flex items-center p-3 border-b text-sm hover:bg-gray-50"
            >
              <div className="w-[15%] break-all font-medium">
                {booking.booking_id}
              </div>
              <div className="w-[15%]">
                {dayjs(booking.createdAt).format("DD MMM YYYY")}
              </div>
              <div className="w-[10%]">
                ₹
                {booking.fare?.toLocaleString("en-IN") ||
                  booking.estimatedFare?.toLocaleString("en-IN") ||
                  "-"}
              </div>
              <div
                className="w-[10%] truncate"
                title={booking.customerDetails.name}
              >
                {booking.customerDetails.name}
              </div>
              <div
                className="w-[10%] truncate"
                title={booking.driverDetails?.driver_name || "-"}
              >
                {booking.driverDetails?.driver_name || "-"}
              </div>
              <div className="w-[10%]">
                {booking.tripType
                  ?.replace(/-/g, " ")
                  ?.replace(/\b\w/g, (l) => l.toUpperCase()) || "-"}
              </div>
              <div className="w-[15%]">{getStatusBadge(booking.status)}</div>
              <div className="w-[15%] flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    updateFilters("view", String(booking._id));
                  }}
                  className="px-3 py-1 rounded bg-site-darkyellow text-white text-sm hover:bg-amber-600 transition-colors"
                >
                  View
                </button>
                {renderActionButtons(booking)}
              </div>
            </div>
          ))
        )}

        <PaginationBox
          pagination={pagination}
          baseUrl="/admin/booking-management"
        />
      </div>

      {/* Booking Details Popup */}
      {selectedBooking && (
        <ViewBooking
          booking={selectedBooking}
          showPopUp={!!selectedBooking}
          onClose={() => {
            setSelectedBooking(null);
            updateFilters("view", "");
          }}
        />
      )}

      {/* Update Modal */}
      {updateModal.show && (
        <SidePopup
          showPopUp={updateModal.show}
          handleClose={resetModal}
          clsprops="px-6 max-w-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-site-black">
              {updateModal.action === "assign_driver" && "Assign Driver"}
              {updateModal.action === "update_status" && "Update Status"}
              {updateModal.action === "cancel_booking" && "Cancel Booking"}
              {updateModal.action === "complete_booking" && "Complete Booking"}
              {updateModal.action === "mark_arrived" &&
                "Mark Driver as Arrived"}
            </h2>
            <button
              onClick={resetModal}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {updateModal.action === "mark_arrived" && renderArrivalOTPModal()}

            {updateModal.action === "assign_driver" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading || isLoadingDrivers}
                >
                  <option value="">Select a driver</option>
                  {allDrivers
                    .filter((driver) => driver.status)
                    .map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.driver_name} (
                        {driver.vehicle_number || "No Vehicle"})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {updateModal.action === "update_status" &&
              updateModal.bookingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select status</option>
                    {getAvailableStatuses(
                      allBookings.find(
                        (b) => b._id === updateModal.bookingId,
                      ) || null,
                    ).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {updateModal.action === "cancel_booking" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            )}

            {updateModal.action === "complete_booking" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Are you sure you want to mark this trip as completed? This
                  action cannot be undone.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            {updateModal.action === "mark_arrived" ? (
              <>
                {otpStep === "initial" && (
                  <button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isLoading ? "Sending..." : "Send OTP to Customer"}
                  </button>
                )}

                {otpStep === "sent" && otpInput.length === 6 && (
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                )}

                {otpStep === "sent" && otpInput.length !== 6 && (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Enter 6-digit OTP
                  </button>
                )}

                {(otpStep === "verifying" || otpStep === "verified") && (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    {otpStep === "verifying" ? "Processing..." : "Success!"}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleSubmitUpdate}
                disabled={
                  isLoading ||
                  (updateModal.action === "assign_driver" && !selectedDriver) ||
                  (updateModal.action === "update_status" && !newStatus) ||
                  (updateModal.action === "cancel_booking" && !cancelReason)
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : updateModal.action === "cancel_booking"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : updateModal.action === "complete_booking"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isLoading
                  ? "Processing..."
                  : updateModal.action === "assign_driver"
                    ? "Assign Driver"
                    : updateModal.action === "update_status"
                      ? "Update Status"
                      : updateModal.action === "cancel_booking"
                        ? "Cancel Booking"
                        : "Complete Booking"}
              </button>
            )}

            <button
              onClick={resetModal}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </SidePopup>
      )}
    </div>
  );
};

export default ManageBooking;
