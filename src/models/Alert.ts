import { DriverDocument } from "@/types/types";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface AlertDocument extends Document {
  alert_id: string;
  booking_id: mongoose.Schema.Types.ObjectId;
  status: string;
  priorityLevel: number;
  assignedDrivers: [
    {
      driverId: mongoose.Schema.Types.ObjectId | DriverDocument;
      assignedAt: Date;
      respondedAt?: Date;
      response: "pending" | "accepted" | "rejected" | "timeout";
      responseTime?: number;
    },
  ];
  currentDriverIndex: number;
  expiresAt: Date;
  acceptedAt: Date;
  cancelledAt: Date;
  maxRetries: number;
  retryCount: number;
  radius: number;
  maxDrivers: number;
}

const alertSchema = new Schema<AlertDocument>(
  {
    alert_id: { type: String, required: true, unique: true, index: true },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Alert details
    status: {
      type: String,
      enum: ["active", "accepted", "expired", "cancelled"],
      default: "active",
    },

    // Priority queue
    priorityLevel: { type: Number, default: 1 }, // 1 = highest priority

    // Driver assignment attempts
    assignedDrivers: [
      {
        driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
        assignedAt: { type: Date },
        respondedAt: { type: Date },
        response: {
          type: String,
          enum: ["pending", "accepted", "rejected", "timeout"],
        },
        responseTime: { type: Number }, // in seconds
      },
    ],

    // Current driver being alerted
    currentDriverIndex: { type: Number, default: 0 },

    // Expiry
    expiresAt: { type: Date },
    acceptedAt: { type: Date },
    cancelledAt: { type: Date },

    // Retry settings
    maxRetries: { type: Number, default: 3 },
    retryCount: { type: Number, default: 0 },

    // Alert parameters
    radius: { type: Number, default: 5 }, // in kilometers
    maxDrivers: { type: Number, default: 10 }, // maximum drivers to alert
  },
  { timestamps: true },
);

const Alert: Model<AlertDocument> =
  mongoose.models.Alert || mongoose.model<AlertDocument>("Alert", alertSchema);

export default Alert;
