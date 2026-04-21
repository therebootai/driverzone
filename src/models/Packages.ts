import mongoose, { Schema, Document, Model } from "mongoose";

export interface PackageDocument extends Document {
  package_id: string;
  name: string;
  duration: number;
  package_type:
    | "in_city"
    | "mini_outstation"
    | "outstation"
    | "hills_tour"
    | "long_tour"
    | "drop_pickup_service";
  company_charge: number;
  driver_charge: number;
  fooding_charge?: number;
  over_time_customer_charge: number;
  over_time_driver_charge: number;
  early_morning_charge?: number;
  late_night_charge?: number;
  service_booking_charge?: number;
  total_price: number;
  destination?: string;
  discount_type: "percentage" | "fixed" | "none";
  discount?: number;
  main_zone?: any;
  service_zone?: any;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PackageSchema = new Schema<PackageDocument>(
  {
    package_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    package_type: {
      type: String,
      enum: [
        "in_city",
        "mini_outstation",
        "outstation",
        "hills_tour",
        "long_tour",
        "drop_pickup_service",
      ],
      required: true,
      default: "in_city",
    },
    company_charge: { type: Number, required: true },
    driver_charge: { type: Number, required: true },
    fooding_charge: { type: Number },
    over_time_customer_charge: { type: Number, required: true },
    over_time_driver_charge: { type: Number, required: true },
    early_morning_charge: { type: Number },
    late_night_charge: { type: Number },
    service_booking_charge: { type: Number },
    total_price: { type: Number, required: true },
    destination: { type: String, trim: true },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },
    discount: {
      type: Number,
      required: function () {
        return this.discount_type !== "none";
      },
    },
    main_zone: { type: Schema.Types.ObjectId, ref: "Zones" },
    service_zone: { type: Schema.Types.ObjectId, ref: "Zones" },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

const Package: Model<PackageDocument> =
  mongoose.models.Package ||
  mongoose.model<PackageDocument>("Package", PackageSchema);

export default Package;
