"use client";

import { useState } from "react";
import { createOTP, verifyOTP } from "@/actions/OTPActions";
import toast from "react-hot-toast";

interface IdentityFormProps {
  data: { name: string; phone: string; otpVerified: boolean };
  onNext: () => void;
  updateData: (data: any) => void;
}

export default function IdentityForm({ data, onNext, updateData }: IdentityFormProps) {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!data.name || !data.phone) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    if (data.phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await createOTP(null, data.phone, "login");
      if (process.env.NODE_ENV !== "production") {
        console.log("DEV OTP:", res); // In production, this would be sent via SMS/WA
      }
      setShowOtp(true);
      toast.success("OTP sent to your phone");
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(null, data.phone, otp, "login");
      if (res.success) {
        updateData({ otpVerified: true });
        toast.success("Mobile verified!");
        onNext();
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-site-gray uppercase">Your Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="John Doe"
            disabled={showOtp}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-site-black outline-none transition-all disabled:bg-gray-50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-site-gray uppercase">Mobile Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="9876543210"
            disabled={showOtp}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-site-black outline-none transition-all disabled:bg-gray-50"
          />
        </div>
      </div>

      {!showOtp ? (
        <button
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full bg-site-black text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-site-gray uppercase">Enter 6-Digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-site-black outline-none text-center tracking-[1em] text-xl font-black"
            />
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-site-green text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
          <button 
            onClick={() => setShowOtp(false)} 
            className="text-xs text-site-gray hover:text-site-black underline transition-colors"
          >
            Change Phone Number
          </button>
        </div>
      )}
    </div>
  );
}
