import { customerTypes } from "@/types/types";
import mongoose, { Schema, Document, Model } from "mongoose";


export type UserNameType ={
    user_name:mongoose.Types.ObjectId | customerTypes[]
}

export interface couponDocument extends Document {
  coupon_id: string;
  coupon_titile: string;
  coupon_code: string;
  coupon_type: string;
  coupon_startDate: string;
  coupon_ExpiryDate: string;
  coupon_value: string;
  minimum_booking_value: string;
  coupon_uses_limit: string;
  users_type: string;
  user_name:UserNameType[];
  status: boolean;
}


const userNameSchema = new Schema<UserNameType>({
    user_name:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customers",
    }
});

const couponSchema = new Schema<couponDocument>(
  {
    coupon_id: { type: String, required: true, unique: true, index: true },
    coupon_titile:{
        type:String,
        unique:true,
        required:true
    },
    coupon_code:{
        type:String,
        unique:true,
        required:true
    },
    coupon_type:{
        type:String
    },
    coupon_startDate:{
        type:String
    },
    coupon_ExpiryDate:{
        type:String
    },
    coupon_value:{
        type:String
    },
    minimum_booking_value:{
        type:String
    },
    coupon_uses_limit:{
        type:String
    },
    users_type:{
        type:String
    },
    user_name:[userNameSchema],
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);



const Coupons: Model<couponDocument> =
  mongoose.models.Coupon || mongoose.model<couponDocument>("Coupon", couponSchema);

export default Coupons;
