import mongoose, { Schema, Document, Model } from "mongoose";
import { BookingDocument } from "./Booking";

export interface VehicleDetails {
  car_name?: string;
  model_name_and_number?: string;
  car_number?: string;
  reg_number?: string;
  car_images_and_rc?: {
    public_id: string;
    secure_url: string;
  }[];
  desc?: string;
  insurance_number?: string;
  insurance_expiry?: Date;
  insurance_document?: {
    public_id: string;
    secure_url: string;
  };

  road_tax_number?: string;
  road_tax_expiry?: Date;
  road_tax_document?: {
    public_id: string;
    secure_url: string;
  };

  pollution_number?: string;
  pollution_expiry?: Date;
  pollution_document?: {
    public_id: string;
    secure_url: string;
  };
}

export interface DriverDocument extends Document {
  driver_id: string;

  driver_name: string;
  mobile_number: string;
  emergency_number?: string;

  currentLocation: {
    lat: number;
    lng: number;
    lastUpdated: Date;
    address: string;
  };

  isOnline: boolean;

  address?: string;
  city_area?: string;
  landmark?: string;
  pin_code?: string;

  identity_id_type?: string;
  identity_id_number?: string;
  identity_id_proof_url?: {
    public_id: string;
    secure_url: string;
  };

  licence_no?: string;
  licence_expiry_date?: Date;
  licence_file_url?: {
    public_id: string;
    secure_url: string;
  };

  currentBooking: mongoose.Schema.Types.ObjectId | BookingDocument | null;

  vehicle_transmission_type?: string;
  vehicle_category_type?: string[];

  employment_type?: "Driver" | "Driver+Car" | "Other";
  remarks?: string;

  vehicle_details?: VehicleDetails;

  status: boolean;
  verified: boolean;
  total_earnings: number;

  avatar?: {
    public_id: string;
    secure_url: string;
  };

  ps_noc?: {
    public_id: string;
    secure_url: string;
  };

  fcmToken?: string;

  maxDistance?: number;
  rating: number;
  total_ratings: number;
  total_rating_sum: number;
  rejectedAlerts: {
    bookingId: mongoose.Schema.Types.ObjectId | BookingDocument;
    rejectedAt: Date;
    reason: string;
  }[];

  approvedDeviceId?: string;
  pendingDeviceId?: string;

  activeAlerts: {
    bookingId: mongoose.Schema.Types.ObjectId | BookingDocument;
    alertSentAt: Date;
    expiresAt: Date;
    status: "pending" | "accepted" | "rejected" | "expired";
  } | null;
  total_rides: number;
}

const vehicleDetailsSchema = new Schema<VehicleDetails>({
  car_name: { type: String },
  model_name_and_number: { type: String },
  car_number: { type: String },
  reg_number: { type: String },
  car_images_and_rc: [
    { public_id: { type: String }, secure_url: { type: String } },
  ],
  desc: { type: String },
  insurance_number: { type: String },
  insurance_expiry: { type: Date },
  insurance_document: {
    public_id: String,
    secure_url: String,
  },

  road_tax_number: { type: String },
  road_tax_expiry: { type: Date },
  road_tax_document: {
    public_id: String,
    secure_url: String,
  },

  pollution_number: { type: String },
  pollution_expiry: { type: Date },
  pollution_document: {
    public_id: String,
    secure_url: String,
  },
});

const driverSchema = new Schema<DriverDocument>(
  {
    driver_id: { type: String, required: true, unique: true, index: true },

    driver_name: { type: String, required: true },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
    },
    emergency_number: {
      type: String,
    },

    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      lastUpdated: { type: Date },
      address: { type: String },
    },

    isOnline: { type: Boolean, default: false },

    address: { type: String },
    city_area: { type: String },
    landmark: { type: String },
    pin_code: { type: String },

    identity_id_type: { type: String },
    identity_id_number: { type: String },
    identity_id_proof_url: {
      public_id: { type: String },
      secure_url: { type: String },
    },

    licence_no: { type: String },
    licence_expiry_date: { type: Date },
    licence_file_url: {
      public_id: { type: String },
      secure_url: { type: String },
    },

    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    employment_type: {
      type: String,
      enum: ["Driver", "Driver+Car"],
      default: "Driver",
    },

    vehicle_transmission_type: {
      type: String,
      enum: ["Automatic", "Manual", "Automatic+Manual"],
      default: "Automatic+Manual",
    },

    vehicle_category_type: {
      type: [String],
      enum: ["SUV", "Hatchback", "Sedan", "Others"],
      default: [],
    },
    remarks: { type: String },

    vehicle_details: {
      type: vehicleDetailsSchema,
      default: null,
    },

    total_earnings: {
      type: Number,
      default: 0,
    },

    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },

    avatar: {
      public_id: { type: String },
      secure_url: { type: String },
    },

    ps_noc: {
      public_id: { type: String },
      secure_url: { type: String },
    },

    fcmToken: { type: String, unique: true, sparse: true },

    maxDistance: { type: Number, default: 20 }, // in kilometers

    rating: {
      type: Number,
      default: 0,
    },
    total_ratings: {
      type: Number,
      default: 0,
    },
    total_rating_sum: {
      type: Number,
      default: 0,
    },

    activeAlerts: {
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
      alertSentAt: { type: Date },
      expiresAt: { type: Date },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "expired"],
        default: "pending",
      },
    },

    rejectedAlerts: [
      {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        rejectedAt: { type: Date },
        reason: { type: String },
      },
    ],

    approvedDeviceId: { type: String },
    pendingDeviceId: { type: String },
    total_rides: { type: Number, default: 0 },
  },
  { timestamps: true },
);

driverSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;

  // Check if isOnline is being set to true
  const isOnlineTrue =
    update.isOnline === true || (update.$set && update.$set.isOnline === true);

  if (isOnlineTrue) {
    // Check if verified is also being set to true in this update
    const isVerifiedTrue =
      update.verified === true ||
      (update.$set && update.$set.verified === true);

    if (!isVerifiedTrue) {
      // Need to check the current verified status of the driver
      const driver = await this.model.findOne(this.getQuery());
      if (driver && !driver.verified) {
        return next(
          new Error("Cannot go online. Your account is not verified yet."),
        );
      }
    }
  }
  next();
});

const Driver: Model<DriverDocument> =
  mongoose.models.Driver ||
  mongoose.model<DriverDocument>("Driver", driverSchema);

export default Driver;
