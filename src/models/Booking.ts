import mongoose, { Schema, Document, Model } from "mongoose";

export interface BookingDocument extends Document {
  booking_id: string;

  fare: number;
  estimatedFare: number;

  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;

  dropAddress: string;
  dropLat: number;
  dropLng: number;

  tripType: "one-way" | "round-trip" | "local" | "outstation" | "others";
  distance: number;
  duration: number;

  customerDetails: any;
  driverDetails: any;

  vehicleType: string;

  otp?: string;
  otp_verified?: boolean;
  otp_sent_at?: Date;
  otp_verified_at?: Date;
  otp_attempts?: number;

  paymentMethod: "cash" | "upi" | "card" | "wallet" | "netbanking";
  paymentStatus: "pending" | "paid" | "failed";
  paid_amount?: number;

  status:
    | "pending"
    | "assigned"
    | "accepted"
    | "arrived"
    | "started"
    | "completed"
    | "cancelled";

  cancelReason?: string;

  driverRating?: number;
  customerRating?: number;

  package_type: any;

  schedule_date: Date;
  schedule_time: string;

  fare_details?: {
    company_charge?: number;
    driver_charge?: number;
    fooding_charge?: number;
    over_time_customer_charge: number;
    over_time_driver_charge: number;
    early_morning_charge?: number;
    late_night_charge?: number;
  };

  insurance?: boolean;

  assignedAt: Date;
  acceptedAt: Date;
  arrivedAt: Date;
  startedAt: Date;
  completedAt: Date;
  cancelledAt: Date;

  coupon?: any;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    booking_id: { type: String, required: true, unique: true, index: true },

    fare: { type: Number },
    estimatedFare: { type: Number },

    pickupAddress: { type: String },
    pickupLat: { type: Number },
    pickupLng: { type: Number },

    dropAddress: { type: String },
    dropLat: { type: Number },
    dropLng: { type: Number },

    tripType: {
      type: String,
      enum: ["one-way", "round-trip", "local", "outstation", "others"],
      default: "one-way",
    },

    distance: { type: Number },
    duration: { type: Number },

    vehicleType: { type: String },

    customerDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    driverDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    otp: { type: String },

    otp_verified: { type: Boolean, default: false },

    otp_sent_at: { type: Date },
    otp_verified_at: { type: Date },

    otp_attempts: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "wallet", "netbanking"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paid_amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "accepted",
        "arrived",
        "started",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    cancelReason: { type: String },

    driverRating: { type: Number },
    customerRating: { type: Number },

    package_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },

    schedule_date: { type: Date },
    schedule_time: { type: String },

    fare_details: {
      company_charge: { type: Number },
      driver_charge: { type: Number },
      fooding_charge: { type: Number },
      over_time_customer_charge: { type: Number },
      over_time_driver_charge: { type: Number },
      early_morning_charge: { type: Number },
      late_night_charge: { type: Number },
    },

    insurance: { type: Boolean, default: false },
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    arrivedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
  },
  { timestamps: true }
);

const Booking: Model<BookingDocument> =
  (mongoose.models && mongoose.models.Booking) ||
  mongoose.model<BookingDocument>("Booking", bookingSchema);

export default Booking;
