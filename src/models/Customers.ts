import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface customerDocument extends Document {
  customer_id: string;
  name: string;
  email: string;
  mobile_number: string;
  sos_mobile_number: string;
  address: string;
  rating: string;
  reg_date: string;
  total_spent: string;
  password: string;
  status: boolean;
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
      required: true,
      unique: true,
    },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
    },
    sos_mobile_number: {
      type: String,
    },
    address: {
      type: String,
    },
    rating: { type: String },
    reg_date: {
      type: String,
    },
    total_spent: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
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
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const Customers: Model<customerDocument> =
  mongoose.models.User ||
  mongoose.model<customerDocument>("Customers", customerSchema);

export default Customers;
