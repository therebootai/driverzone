import mongoose, { Schema, Document, Model } from "mongoose";

interface OTPDocument extends Document {
  email?: string;
  phone?: string;
  otp: string;
  type: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<OTPDocument>(
  {
    email: {
      type: String,
      required: function () {
        return !this.phone;
      },
    },
    phone: {
      type: String,
      required: function () {
        return !this.email;
      },
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "login",
        "register",
        "reset-password",
        "verify-account",
        "booking-arrival",
      ],
      default: "login",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple active OTPs for same user
otpSchema.index(
  {
    email: 1,
    phone: 1,
    verified: 1,
  },
  {
    partialFilterExpression: { verified: false },
  }
);

const OTP: Model<OTPDocument> =
  mongoose.models.OTP || mongoose.model<OTPDocument>("OTP", otpSchema);

export default OTP;
