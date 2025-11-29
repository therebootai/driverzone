import mongoose, { Schema, Document, Model } from "mongoose";

export interface ZoneDocument extends Document {
  zone_id: string;
  name: string;
  description?: string;
  center: {
    type: string;
    coordinates: number[];
  };
  coordinates: number[][];
  area: number;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const ZoneSchema = new Schema<ZoneDocument>(
  {
    zone_id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    center: pointSchema,
    coordinates: { type: [[Number]], required: true },
    area: { type: Number, required: true },
    status: { type: Boolean, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ZoneSchema.index({ center: "2dsphere" });

const Zone =
  mongoose.models.Zones || mongoose.model<ZoneDocument>("Zones", ZoneSchema);

export default Zone;
