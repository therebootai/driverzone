import mongoose, { Schema, Document, Model } from "mongoose";

export interface PackageDocument extends Document {
  package_id: string;
  name: string;
  duration: number;
  company_charge: number;
  driver_charge: number;
  fooding_charge: number;
  over_time_customer_charge: number;
  over_time_driver_charge: number;
  early_morning_charge?: number;
  late_night_charge?: number;
  total_price: number;
  destination: string;
  main_zone?: mongoose.Types.ObjectId;
  service_zone?: mongoose.Types.ObjectId;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PackageSchema = new Schema<PackageDocument>(
  {
    package_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    company_charge: { type: Number, required: true },
    driver_charge: { type: Number, required: true },
    fooding_charge: { type: Number, required: true },
    over_time_customer_charge: { type: Number, required: true },
    over_time_driver_charge: { type: Number, required: true },
    early_morning_charge: { type: Number },
    late_night_charge: { type: Number },
    total_price: { type: Number, required: true },
    destination: { type: String, required: true, trim: true },
    main_zone: { type: Schema.Types.ObjectId, ref: "Zone" },
    service_zone: { type: Schema.Types.ObjectId, ref: "Zone" },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const Packages: Model<PackageDocument> =
  mongoose.models.Packages || mongoose.model("Packages", PackageSchema);

export default Packages;
