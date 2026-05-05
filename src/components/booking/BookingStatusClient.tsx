"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  FaCheckCircle,
  FaClock,
  FaCar,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaUser,
  FaHeadset,
  FaWhatsapp,
  FaSms,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

const BookingMap = dynamic(() => import("./BookingMap"), { ssr: false });

export default function BookingStatusClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleSendOTP = async () => {
    if (!booking?._id) return;
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/booking/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking._id }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/booking/${bookingId}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch status", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-site-black border-t-transparent rounded-full animate-spin" />
        <p className="text-site-gray font-bold animate-pulse uppercase tracking-widest text-xs">
          Tracking your ride...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-black">Booking Not Found</h1>
        <p className="text-site-gray max-w-md">
          We couldn&apos;t find the booking you&apos;re looking for. It may have
          expired or the link might be incorrect.
        </p>
        <Link
          href="/"
          className="bg-site-black text-white px-8 py-3 rounded-full font-bold"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { label: "Booked", status: "pending", icon: <FaCheckCircle /> },
    { label: "Assigned", status: "assigned", icon: <FaCar /> },
    { label: "Started", status: "started", icon: <FaClock /> },
    { label: "Completed", status: "completed", icon: <FaCheckCircle /> },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.status === booking.status,
  );
  const actualIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-xs font-bold text-site-gray hover:text-site-black transition-colors uppercase tracking-widest"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Track Booking</h1>
          <p className="text-site-gray font-medium">
            ID:{" "}
            <span className="text-site-black font-bold">
              {booking.booking_id}
            </span>
          </p>
        </div>
        <div className="bg-site-lime px-6 py-2 rounded-full font-black text-site-black shadow-sm uppercase tracking-tighter text-sm">
          {booking.status.replace("_", " ")}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <FaCar size={120} />
        </div>

        <div className="flex justify-between items-center relative">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />
          <motion.div
            className="absolute top-5 left-0 h-1 bg-site-green -z-0"
            initial={{ width: 0 }}
            animate={{
              width: `${(actualIndex / (statusSteps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 1 }}
          />

          {statusSteps.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-3 relative z-10"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                  i <= actualIndex
                    ? "bg-site-green text-white border-white shadow-lg"
                    : "bg-white text-gray-300 border-gray-100"
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  i <= actualIndex ? "text-site-black" : "text-gray-300"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Booking Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Map */}
          <div className="h-80 md:h-[450px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            <BookingMap
              pickup={{ lat: booking.pickupLat, lng: booking.pickupLng }}
              drop={{ lat: booking.dropLat, lng: booking.dropLng }}
              stop={
                booking.stopLat
                  ? { lat: booking.stopLat, lng: booking.stopLng }
                  : undefined
              }
            />
          </div>

          {/* Location Info */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 text-site-green rounded-full flex items-center justify-center shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-site-gray uppercase tracking-widest">
                  Pickup Location
                </span>
                <p className="font-bold text-site-black leading-snug">
                  {booking.pickupAddress}
                </p>
              </div>
            </div>

            <div className="ml-5 h-8 border-l-2 border-dashed border-gray-200" />

            {booking.stopAddress && (
              <>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-50 text-site-saffron rounded-full flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-site-gray uppercase tracking-widest">
                      Via Stop
                    </span>
                    <p className="font-bold text-site-black leading-snug">
                      {booking.stopAddress}
                    </p>
                  </div>
                </div>
                <div className="ml-5 h-8 border-l-2 border-dashed border-gray-200" />
              </>
            )}

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-site-gray uppercase tracking-widest">
                  Drop Location
                </span>
                <p className="font-bold text-site-black leading-snug">
                  {booking.dropAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Driver & Package Info */}
        <div className="flex flex-col gap-8">
          {/* Driver Card */}
          <div className="bg-site-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110" />

            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter">
                  Your Driver
                </h3>
                {booking.driverDetails?.rating && (
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                    <FaStar className="text-site-lime" />{" "}
                    {booking.driverDetails.rating}
                  </div>
                )}
              </div>

              {booking.driverDetails ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20">
                      {booking.driverDetails.profile_picture ? (
                        <Image
                          src={booking.driverDetails.profile_picture}
                          alt="Driver"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <FaUser className="text-white/40 text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-lg">
                        {booking.driverDetails.driver_name}
                      </h4>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                        {booking.driverDetails.vehicle_number}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${booking.driverDetails.mobile_number}`}
                    className="w-full bg-site-lime text-site-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                  >
                    <FaPhoneAlt /> CALL DRIVER
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 gap-4 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <FaCar className="text-white/20 text-3xl" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-white/60">
                      Searching for Driver...
                    </p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none">
                      We&apos;ll notify you once assigned
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Request OTP Card */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col gap-4">
            <h3 className="text-sm font-black text-site-gray uppercase tracking-widest">
              Ride OTP
            </h3>
            <p className="text-xs text-site-gray leading-relaxed">
              Share this OTP with the driver when they arrive to verify your identity.
            </p>
            {otpSent ? (
              <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3 border border-green-100">
                <FaCheckCircle className="text-site-green shrink-0 text-lg" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-site-black">OTP Sent!</span>
                  <span className="text-[10px] text-site-gray">
                    Sent to {booking.customerDetails?.mobile_number || "customer"}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSendOTP}
                disabled={otpSending}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold transition-all bg-site-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSms className="text-lg" />
                {otpSending ? "Sending..." : "Send OTP to Customer"}
              </button>
            )}
            {otpError && (
              <p className="text-xs text-red-500 font-medium">{otpError}</p>
            )}
          </div>

          {/* Package Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col gap-6">
            <h3 className="text-sm font-black text-site-gray uppercase tracking-widest">
              Booking Summary
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-site-gray">Package</span>
                <span className="font-bold text-site-black whitespace-nowrap">
                  {booking.package_type?.name || "Standard"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-site-gray">Duration</span>
                <span className="font-bold text-site-black">
                  {booking.package_type?.duration || "--"} Hours
                </span>
              </div>
              <div className="h-px bg-gray-50 w-full" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-site-gray">Total Fare</span>
                <span className="text-2xl font-black text-site-black tracking-tighter">
                  ₹{booking.fare}/-
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
              <FaCheckCircle className="text-site-green shrink-0" />
              <p className="text-[10px] font-bold text-site-gray uppercase leading-tight">
                Payment to be made in cash directly to the driver after the
                trip.
              </p>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col gap-4">
            <h3 className="text-sm font-black text-site-gray uppercase tracking-widest">
              Need Help?
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://api.whatsapp.com/send?phone=918509299342"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <FaWhatsapp className="text-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-site-black">WhatsApp Us</span>
                  <span className="text-[10px] text-site-gray font-medium">Chat with support</span>
                </div>
              </a>
              <a
                href="tel:+917001606510"
                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                  <FaHeadset className="text-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-site-black">Call Support</span>
                  <span className="text-[10px] text-site-gray font-medium">24/7 helpline</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
