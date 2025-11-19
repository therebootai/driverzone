import { Types } from "mongoose";


export type UserNameForm = {
   _id?: Types.ObjectId;
  user_name: string; 
};

export type CouponFormState = {
  coupon_id?:string
  coupon_title: string;
  coupon_code: string;
  coupon_type: string;
  coupon_startDate: string;
  coupon_ExpiryDate: string;
  coupon_value: string;
  minimum_booking_value: string;
  coupon_uses_limit: string;
  users_type: string;
  status?:boolean;
  user_name: UserNameForm[];
};


export type customerTypes = {
    _id: Types.ObjectId ;
  customer_id?: string;
  name?: string;
  email?: string;
  mobile_number?: string;
  sos_mobile_number?: string;
  address?: string;
  rating?: string;
  reg_date?: string;
  total_spent?: string;
  password?: string;
  status?: boolean;
}