"use client";

import React, { useEffect, useState } from "react";
import { BookingTypes } from "@/types/types";
import { GET_ALL_PACKAGES } from "@/actions/packageAction";
import { updateBooking } from "@/actions/bookingAction";
import BasicInput from "@/ui/BasicInput";
import BasicSelectWithLabel from "@/ui/BasicSelectWithLabel";
import toast from "react-hot-toast";
import dayjs from "dayjs";

interface EditBookingFormProps {
  booking: BookingTypes;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBookingForm: ({
  booking,
  onClose,
  onSuccess,
}: EditBookingFormProps) => React.JSX.Element = ({
  booking,
  onClose,
  onSuccess,
}: EditBookingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  // Form states
  const [scheduleDate, setScheduleDate] = useState(
    booking.schedule_date
      ? dayjs(booking.schedule_date).format("YYYY-MM-DD")
      : ""
  );
  const [scheduleTime, setScheduleTime] = useState(booking.schedule_time || "");
  const [duration, setDuration] = useState(booking.duration || 0);
  const [paymentMethod, setPaymentMethod] = useState(
    booking.paymentMethod || "cash"
  );
  const [paymentStatus, setPaymentStatus] = useState(
    booking.paymentStatus || "pending"
  );
  const [paidAmount, setPaidAmount] = useState(booking.paid_amount || 0);
  const [selectedPackage, setSelectedPackage] = useState(
    booking.package_type?._id || ""
  );

  // Fare Details states
  const [companyCharge, setCompanyCharge] = useState(
    booking.fare_details?.company_charge || 0
  );
  const [driverCharge, setDriverCharge] = useState(
    booking.fare_details?.driver_charge || 0
  );
  const [foodingCharge, setFoodingCharge] = useState(
    booking.fare_details?.fooding_charge || 0
  );
  const [earlyMorningCharge, setEarlyMorningCharge] = useState(
    booking.fare_details?.early_morning_charge || 0
  );
  const [lateNightCharge, setLateNightCharge] = useState(
    booking.fare_details?.late_night_charge || 0
  );
  const [serviceBookingCharge, setServiceBookingCharge] = useState(
    booking.fare_details?.service_booking_charge || 0
  );
  const [totalFare, setTotalFare] = useState(booking.fare || 0);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await GET_ALL_PACKAGES({ limit: 100, status: true });
        if (response.success) {
          setPackages(response.data);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        schedule_date: new Date(scheduleDate),
        schedule_time: scheduleTime,
        duration: Number(duration),
        paymentMethod,
        paymentStatus,
        paid_amount: Number(paidAmount),
        package_type: selectedPackage,
        fare: Number(totalFare),
        fare_details: {
          company_charge: Number(companyCharge),
          driver_charge: Number(driverCharge),
          fooding_charge: Number(foodingCharge),
          early_morning_charge: Number(earlyMorningCharge),
          late_night_charge: Number(lateNightCharge),
          service_booking_charge: Number(serviceBookingCharge),
        },
      };

      const response = await updateBooking(booking._id, updateData, {
        forceStatusChange: true, // Allow editing even if status is not ideal
      });

      if (response.success) {
        toast.success("Booking updated successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || "Failed to update booking");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BasicInput
          label="Schedule Date"
          type="date"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          required
        />
        <BasicInput
          label="Schedule Time"
          type="text"
          placeholder="e.g. 10:00 AM"
          value={scheduleTime}
          onChange={(e) => setScheduleTime(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BasicInput
          label="Duration (Hours)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />
        <BasicSelectWithLabel
          label="Package"
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          opts={packages.map((pkg) => ({
            label: `${pkg.name} (₹${pkg.total_price})`,
            value: pkg._id,
          }))}
        />
      </div>

      <div className="border-t pt-4 mt-2">
        <h3 className="font-medium mb-3">Payment & Fare Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BasicInput
            label="Company Charge"
            type="number"
            value={companyCharge}
            onChange={(e) => setCompanyCharge(Number(e.target.value))}
          />
          <BasicInput
            label="Driver Charge"
            type="number"
            value={driverCharge}
            onChange={(e) => setDriverCharge(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BasicInput
            label="Fooding Charge"
            type="number"
            value={foodingCharge}
            onChange={(e) => setFoodingCharge(Number(e.target.value))}
          />
          <BasicInput
            label="Service Booking Charge"
            type="number"
            value={serviceBookingCharge}
            onChange={(e) => setServiceBookingCharge(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BasicInput
            label="Early Morning Charge"
            type="number"
            value={earlyMorningCharge}
            onChange={(e) => setEarlyMorningCharge(Number(e.target.value))}
          />
          <BasicInput
            label="Late Night Charge"
            type="number"
            value={lateNightCharge}
            onChange={(e) => setLateNightCharge(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BasicInput
            label="Total Fare (Customer Price)"
            type="number"
            value={totalFare}
            onChange={(e) => setTotalFare(Number(e.target.value))}
          />
          <BasicInput
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BasicSelectWithLabel
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            opts={[
              { label: "Cash", value: "cash" },
              { label: "Online", value: "online" },
              { label: "UPI", value: "upi" },
              { label: "Card", value: "card" },
              { label: "Wallet", value: "wallet" },
              { label: "Net Banking", value: "netbanking" },
            ]}
          />
          <BasicSelectWithLabel
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            opts={[
              { label: "Pending", value: "pending" },
              { label: "Paid", value: "paid" },
              { label: "Failed", value: "failed" },
            ]}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isLoading ? "Updating..." : "Update Booking"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditBookingForm;
