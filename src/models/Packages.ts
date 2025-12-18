import mongoose, { Schema, Document, Model } from "mongoose";
import { ZoneDocument } from "./Zones";

export interface PackageDocument extends Document {
  package_id: string;
  name: string;
  duration: number;
  package_type:
    | "city_tour"
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
  total_price: number;
  destination?: string;
  discount_type: "percentage" | "fixed" | "none";
  discount?: number;
  main_zone?: mongoose.Types.ObjectId | ZoneDocument;
  service_zone?: mongoose.Types.ObjectId | ZoneDocument;
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
        "city_tour",
        "mini_outstation",
        "outstation",
        "hills_tour",
        "long_tour",
        "drop_pickup_service",
      ],
      required: true,
      default: "city_tour",
    },
    company_charge: { type: Number, required: true },
    driver_charge: { type: Number, required: true },
    fooding_charge: { type: Number },
    over_time_customer_charge: { type: Number, required: true },
    over_time_driver_charge: { type: Number, required: true },
    early_morning_charge: { type: Number },
    late_night_charge: { type: Number },
    total_price: { type: Number, required: true },
    destination: { type: String, trim: true },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },
    main_zone: { type: Schema.Types.ObjectId, ref: "Zone" },
    service_zone: { type: Schema.Types.ObjectId, ref: "Zone" },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const Packages: Model<PackageDocument> =
  mongoose.models.Packages || mongoose.model("Packages", PackageSchema);

export default Packages;
