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


export type VehicleDetails = {
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

export type DriverDocument= {
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
  
createdAt?:string;
updatedAt?:string

}


export type BookingTypes= {
  booking_id?: string;
  fare?: number;
  estimatedFare?: number;

  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;

  dropAddress: string;
  dropLat: number;
  dropLng: number;

  tripType?: "one-way" | "round-trip" | "local" | "outstation";
  distance?: number;
  duration?: number;

  customerDetails: string;
  driverDetails?: string | null;

  vehicleType: string;

  otp?: string;

  paymentMethod?: "cash" | "upi" | "card" | "wallet";
  paymentStatus?: "pending" | "paid" | "failed";

  status?:
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


export type GetBookingsParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  booking_id?: string;
  customerId?: string;
  driverId?: string;
  status?: 
    | "pending"
    | "assigned"
    | "accepted"
    | "arrived"
    | "started"
    | "completed"
    | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed";
  tripType?: "one-way" | "round-trip" | "local" | "outstation";
  startDate?: string | Date;
  endDate?: string | Date;
  sort?: any;
};