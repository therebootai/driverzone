"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import OTP from "@/models/OTP";
import { SEND_BY_WHATSAPP } from "./waActions";

await ensureModelsRegistered();

function generateOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

async function createOTP(
  email: string | null | undefined = null,
  phone: string | null | undefined = null,
  type:
    | "login"
    | "register"
    | "reset-password"
    | "verify-account"
    | "booking-arrival"
    | "update-profile" = "login",
  predefinedOtp?: string,
) {
  await connectToDatabase();
  // Clean old OTPs for this user
  await OTP.deleteMany({
    $or: [{ email }, { phone }],
    verified: false,
  });

  const otp = predefinedOtp || generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || "10"),
  );

  const otpRecord = new OTP({
    email,
    phone,
    otp,
    type,
    expiresAt,
  });

  await otpRecord.save();

  if (process.env.NODE_ENV !== "production") {
    console.log("Generated OTP:", otp);
  }

  // Send OTP if phone is provided
  if (phone) {
    try {
      await SEND_BY_WHATSAPP({
        mobile: phone,
        message: otp, // Assuming the template handles the variable correctly
      });
    } catch (e) {
      console.error("Failed to send WhatsApp OTP:", e);
    }
  }

  return otp;
}

async function verifyOTP(
  email: string | null = null,
  phone: string | null = null,
  otp: string,
  type:
    | "login"
    | "register"
    | "reset-password"
    | "verify-account"
    | "booking-arrival"
    | "update-profile" = "login",
) {
  await connectToDatabase();
  const otpRecord = await OTP.findOne({
    $or: [{ email }, { phone }],
    otp,
    type,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  // Check attempts
  if (otpRecord.attempts >= 3) {
    await OTP.findByIdAndDelete(otpRecord._id);
    return {
      success: false,
      message: "Too many attempts. Please request a new OTP.",
    };
  }

  // Increment attempts
  otpRecord.attempts += 1;

  // Verify OTP
  if (otpRecord.otp === otp) {
    otpRecord.verified = true;
    await otpRecord.save();

    // Clean up old OTPs for this user
    await OTP.deleteMany({
      $or: [{ email }, { phone }],
      verified: false,
      _id: { $ne: otpRecord._id },
    });

    return {
      success: true,
      message: "OTP verified successfully",
      data: { email, phone },
    };
  }

  await otpRecord.save();
  return {
    success: false,
    message: "Invalid OTP",
    attemptsLeft: 3 - otpRecord.attempts,
  };
}

async function resendOTP(
  email: string | null = null,
  phone: string | null = null,
  type:
    | "login"
    | "register"
    | "reset-password"
    | "verify-account"
    | "booking-arrival"
    | "update-profile" = "login",
) {
  await connectToDatabase();
  // Check if there's an unverified OTP
  const existingOtp = await OTP.findOne({
    $or: [{ email }, { phone }],
    verified: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 },
  });

  if (existingOtp) {
    // Check if enough time has passed (at least 30 seconds)
    const timeElapsed = Date.now() - existingOtp.createdAt.getTime();
    if (timeElapsed < 30000) {
      return {
        success: false,
        message: "Please wait before requesting a new OTP",
        waitTime: Math.ceil((30000 - timeElapsed) / 1000),
      };
    }
  }

  // Generate new OTP
  const newOtp = await createOTP(email, phone, type);

  if (process.env.NODE_ENV !== "production") {
    console.log("Generated resend OTP:", newOtp);
  }

  // Send OTP
  // if (email) {
  //   await sendOTPByEmail(email, newOtp);
  // } else if (phone) {
  //   await sendOTPBySMS(phone, newOtp);
  // }

  return { success: true, message: "OTP sent successfully", data: newOtp };
}

export { createOTP, verifyOTP, resendOTP };
