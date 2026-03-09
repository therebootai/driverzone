import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Coupons from "@/models/Coupon";
import Customer from "@/models/Customers";
import { verifyCustomerToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureModelsRegistered();

    let usedCouponIds: string[] = [];
    const token = request.headers.get("authorization");
    
    if (token) {
      try {
        const user = await verifyCustomerToken(token.split("Bearer ")[1]);
        if (user) {
          const customerRecord = await Customer.findById(user._id);
          if (customerRecord && customerRecord.used_coupons) {
            usedCouponIds = customerRecord.used_coupons.map((c: any) => c.toString());
          }
        }
      } catch (err) {
        // Ignore token errors
      }
    }

    const allCoupons = await Coupons.find({ status: true });
    
    // Filter out used coupons
    const coupons = allCoupons.filter((c: any) => !usedCouponIds.includes(c._id.toString()));

    return NextResponse.json({ coupons, success: true }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 }
    );
  }
}
