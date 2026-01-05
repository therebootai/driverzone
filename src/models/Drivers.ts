import mongoose, { Schema, Document, Model } from "mongoose";

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
  vehicle_transmission_type?: string[];
  vehicle_category_type?: string[];

  employment_type?: "Driver" | "Driver+Car" | "Other";
  remarks?: string;

  vehicle_details?: VehicleDetails;

  status: boolean;
}

const vehicleDetailsSchema = new Schema<VehicleDetails>(
  {
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
  
  }
);

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
      unique: true,
    },

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

    employment_type: {
      type: String,
      enum: ["Driver", "Driver+Car"],
      default: "Driver",
    },

    vehicle_transmission_type: {
      type: [String],
      enum: ["Automatic", "Manual"],
      default: [],
    },

    vehicle_category_type: {
      type: [String],
      enum: ["SUV", "Hatchback", "Sedan", "Others"],
      default: [],
    },
    remarks: { type: String },

    vehicle_details: vehicleDetailsSchema,

    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const Driver: Model<DriverDocument> =
  mongoose.models.Driver ||
  mongoose.model<DriverDocument>("Driver", driverSchema);

export default Driver;
