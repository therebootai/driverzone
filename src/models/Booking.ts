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

  tripType: "one-way" | "round-trip" | "local" | "outstation";
  distance: number; 
  duration: number; 

  customerDetails: mongoose.Types.ObjectId;
  driverDetails: mongoose.Types.ObjectId | null;

  vehicleType: string; 

  otp: string; 
  paymentMethod: "cash" | "upi" | "card" | "wallet";
  paymentStatus: "pending" | "paid" | "failed";

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
}

const bookingSchema = new Schema<BookingDocument>(
  {
    booking_id: { type: String, required: true, unique: true, index: true },

    fare: {type:Number},
    estimatedFare: {type:Number},

    pickupAddress: {type:String},
    pickupLat: {type:Number},
    pickupLng: {type:Number},

    dropAddress: {type:String},
    dropLat: {type:Number},
    dropLng: {type:Number},

    tripType: {
      type: String,
      enum: ["one-way", "round-trip", "local", "outstation"],
      default: "one-way",
    },

    distance: {type:Number},
    duration: {type:Number},

    vehicleType: {type:String},

    customerDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      required: true,
    },

    driverDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drivers",
      default: null,
    },

    otp: {type:String},

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "wallet"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
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

    cancelReason: {type:String},

    driverRating: {type:Number},
    customerRating: {type:Number},
  },
  { timestamps: true }
);

const Booking: Model<BookingDocument> =
  (mongoose.models && mongoose.models.Booking) ||
  mongoose.model<BookingDocument>("Booking", bookingSchema);

export default Booking;
