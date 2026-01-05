import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";
import Coupons from "@/models/Coupon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureModelsRegistered();

    const coupons = await Coupons.find({ status: true });

    return NextResponse.json({ coupons, success: true }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, success: false },
      { status: 500 }
    );
  }
}
