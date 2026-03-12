import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface customerDocument extends Document {
  customer_id: string;
  name?: string;
  email?: string;
  mobile_number?: string;
  sos_mobile_number?: string;
  address?: string;
  rating?: string;
  average_rating?: number;
  total_ratings?: number;
  reg_date?: string;
  profile_picture?: {
    public_id: string;
    secure_url: string;
  };
  cover_picture?: {
    public_id: string;
    secure_url: string;
  };
  total_spent?: string;
  password?: string;
  status: boolean;
  used_coupons?: Array<any>;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const customerSchema = new Schema<customerDocument>(
  {
    customer_id: { type: String, required: true, unique: true, index: true },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function (this: customerDocument) {
        return !this.mobile_number;
      },
    },
    mobile_number: {
      type: String,
      required: function (this: customerDocument) {
        return !this.email;
      },
      unique: true,
    },
    sos_mobile_number: {
      type: String,
    },
    address: {
      type: String,
    },
    rating: { type: String },
    average_rating: { type: Number, default: 0 },
    total_ratings: { type: Number, default: 0 },
    reg_date: {
      type: String,
      default: Date.now,
    },
    profile_picture: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    cover_picture: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    total_spent: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    used_coupons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
        default: [],
      },
    ],
  },
  { timestamps: true },
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error("Unknown error occurred"));
  }
});

customerSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const Customer: Model<customerDocument> =
  mongoose.models.Customer ||
  mongoose.model<customerDocument>("Customer", customerSchema);

export default Customer;
