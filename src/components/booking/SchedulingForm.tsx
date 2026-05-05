"use client";

import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCar,
  FaClock,
  FaCalendarDay,
  FaShieldAlt,
} from "react-icons/fa";
import { useMemo } from "react";

interface SchedulingFormProps {
  data: any;
  allPackages: any[];
  onSubmit: () => void;
  onBack: () => void;
  updateData: (data: any) => void;
  loading: boolean;
}

const VEHICLES = [
  { id: "SUV", name: "SUV", icon: <FaCar />, desc: "Innova, XUV, Fortuner" },
  {
    id: "Hatchback",
    name: "Hatchback",
    icon: <FaCar />,
    desc: "Swift, WagonR, i20",
  },
  { id: "Sedan", name: "Sedan", icon: <FaCar />, desc: "Dzire, Amaze, Verna" },
  { id: "Mini", name: "Mini", icon: <FaCar />, desc: "Alto, Kwid, S-Presso" },
  { id: "Van", name: "Van", icon: <FaCar />, desc: "Omni, Eeco" },
  {
    id: "Others",
    name: "Others",
    icon: <FaCar />,
    desc: "Custom Vehicle Type",
  },
];

export default function SchedulingForm({
  data,
  allPackages,
  onSubmit,
  onBack,
  updateData,
  loading,
}: SchedulingFormProps) {
  const pkg = data.selectedPackage;
  const duration = pkg?.duration || 0;

  const fareBreakdown = useMemo(() => {
    const insuranceCharge = data.insurance ? 20 : 0;
    const foodingCharge = duration > 3 ? (pkg?.fooding_charge || 0) : 0;

    let discountAmount = 0;
    if (pkg?.discount_type === "percentage" && pkg?.discount) {
      const basePrice = (pkg.company_charge || 0) + (pkg.driver_charge || 0) + (pkg.fooding_charge || 0);
      discountAmount = (basePrice * pkg.discount) / 100;
    } else if (pkg?.discount_type === "fixed" && pkg?.discount) {
      discountAmount = pkg.discount;
    }

    const subtotal = (pkg?.company_charge || 0) + (pkg?.driver_charge || 0) + foodingCharge;
    const total = subtotal + insuranceCharge - discountAmount;

    return { subtotal, foodingCharge, insuranceCharge, discountAmount, total };
  }, [data.insurance, pkg, duration]);

  const handleFinalSubmit = () => {
    const now = new Date();
    const selectedDate = new Date(data.date);

    // Reset hours to compare dates only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Booking date cannot be in the past");
      return;
    }

    if (selectedDate.getTime() === today.getTime()) {
      const [hours, minutes] = data.time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      const minTime = new Date(now.getTime() + 30 * 60000);
      if (selectedTime < minTime) {
        toast.error("Booking time must be at least 30 minutes from now");
        return;
      }
    }

    onSubmit();
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4">
      <div className="flex flex-col gap-6">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-site-gray uppercase tracking-widest">
              Date
            </label>
            <div className="relative">
              <FaCalendarDay className="absolute left-4 top-1/2 -translate-y-1/2 text-site-gray text-xs" />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={
                  data.date instanceof Date
                    ? data.date.toISOString().split("T")[0]
                    : data.date
                }
                onChange={(e) => updateData({ date: new Date(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-site-black outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-site-gray uppercase tracking-widest">
              Time
            </label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-site-gray text-xs" />
              <input
                type="time"
                value={data.time}
                onChange={(e) => updateData({ time: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-site-black outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-site-gray uppercase tracking-widest">
            Vehicle Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                onClick={() => updateData({ vehicleType: v.id })}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  data.vehicleType === v.id
                    ? "border-site-black bg-gray-50 shadow-md"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    data.vehicleType === v.id
                      ? "bg-site-black text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {v.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-site-black truncate">
                    {v.name}
                  </h4>
                  <p className="text-[9px] text-site-gray uppercase font-bold tracking-tighter truncate">
                    {v.desc}
                  </p>
                </div>
                {data.vehicleType === v.id && (
                  <FaCheckCircle className="text-site-green shrink-0 text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Insurance Toggle */}
        <button
          type="button"
          onClick={() => updateData({ insurance: !data.insurance })}
          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
            data.insurance
              ? "border-site-green bg-green-50/50"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              data.insurance
                ? "bg-site-green text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <FaShieldAlt />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-site-black">
              Yes, Insurance
            </h4>
            <p className="text-[9px] text-site-gray uppercase font-bold tracking-tighter">
              ₹20 coverage for your trip
            </p>
          </div>
          {data.insurance && (
            <FaCheckCircle className="text-site-green shrink-0 text-xs" />
          )}
        </button>

        {/* Summary Card */}
        <div className="bg-site-black p-6 rounded-3xl text-white shadow-xl mt-2 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Selected Package
                </span>
                <h3 className="text-lg font-bold">
                  {pkg?.name || "Standard Booking"}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Estimated Fare
                </span>
                <h3 className="text-2xl font-black text-site-lime">
                  ₹{fareBreakdown.total}/-
                </h3>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Fare Breakdown */}
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-white/50">Subtotal</span>
                <span>₹{fareBreakdown.subtotal}</span>
              </div>
              {fareBreakdown.foodingCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/50">Fooding Charge</span>
                  <span>₹{fareBreakdown.foodingCharge}</span>
                </div>
              )}
              {data.insurance && (
                <div className="flex justify-between">
                  <span className="text-white/50">Insurance</span>
                  <span>₹{fareBreakdown.insuranceCharge}</span>
                </div>
              )}
              {fareBreakdown.discountAmount > 0 && (
                <div className="flex justify-between text-site-lime">
                  <span>Discount</span>
                  <span>-₹{fareBreakdown.discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div className="flex flex-col gap-1">
                <span className="text-white/40 font-bold uppercase tracking-tighter">
                  Pickup
                </span>
                <p className="line-clamp-1">
                  {data.pickup?.address || "Not set"}
                </p>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-white/40 font-bold uppercase tracking-tighter">
                  Drop
                </span>
                <p className="line-clamp-1">
                  {data.drop?.address || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border border-gray-200 text-site-black py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>
        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="flex-[2] bg-site-green text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Placing Booking..." : "Confirm Booking"}{" "}
          <FaCheckCircle className="text-xs" />
        </button>
      </div>
    </div>
  );
}
