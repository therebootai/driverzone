"use server"
import connectToDataBase, { ensureModelsRegistered } from "@/db/connection";
import Coupons from "@/models/Coupon";
import { CouponFormState } from "@/types/types";
import { generateCustomId } from "@/utils/generateCustomId";
import { revalidatePath } from "next/cache";

await ensureModelsRegistered();

export async function createCoupon(data: CouponFormState) {
  try {
    await connectToDataBase();

    const existingcouponTitle = await Coupons.findOne({
      coupon_title: data.coupon_title,
    });
    if (existingcouponTitle) {
      return { success: false, error: "This Coupon Title already exists" };
    }
    const existingCouponCode = await Coupons.findOne({
      coupon_code: data.coupon_code,
    });
    if (existingCouponCode) {
      return { success: false, error: "This Coupon Code already exists" };
    }
    if (!data.coupon_id) {
      data.coupon_id = await generateCustomId(Coupons, "coupon_id", "couponid");
    }

    const newCoupon = new Coupons(data);

    const savedCoupon = await newCoupon.save();

    revalidatePath("/coupon");
    return { success: true, coupon: JSON.parse(JSON.stringify(savedCoupon)) };
  } catch (error: any) {
    console.error("Error creating Coupon:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}


function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


export async function getAllCoupon({
  page = 1,
  limit = 20,
  searchTerm,
  status,
}: {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: boolean;
}) {
  try {
    await connectToDataBase();

    // Normalize pagination
    const _page = Math.max(1, Number(page) || 1);
    const _limit = Math.max(1, Math.min(100, Number(limit) || 20)); // cap to 100

    // Build conditions
    const andConditions: any[] = [];

    if (typeof status === "boolean") {
      andConditions.push({ status });
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const term = escapeRegex(searchTerm.trim());
      andConditions.push({
        $or: [
          { coupon_title: { $regex: term, $options: "i" } },
          { coupon_code: { $regex: term, $options: "i" } },
        ],
      });
    }

    const query = andConditions.length ? { $and: andConditions } : {};

    const [allcoupon, totalCoupon] = await Promise.all([
      Coupons.find(query, { password: 0 }) 
        .sort({ createdAt: -1 })
        .skip((_page - 1) * _limit)
        .limit(_limit)
        .populate("user_name.user_name")
        .lean(),
      Coupons.countDocuments(query),
    ]);

     const serializedCoupon = JSON.parse(JSON.stringify(allcoupon));

    return {
      success: true,
      data: serializedCoupon,
      paginations: {
        totalPages: Math.ceil(totalCoupon / _limit),
        currentPage: _page,
        totalItems: totalCoupon,
        perPage: _limit,
      },
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error?.message || "Unknown error",
      data: [],
      paginations: { totalPages: 0, currentPage: 1, totalItems: 0, perPage: 20 },
    };
  }
}


export async function updateCoupon(
  coupon_id: string,
  updatedData: CouponFormState
) {
  try {
    await connectToDataBase();

    if (!coupon_id) {
      return { success: false, error: "Coupon ID is required" };
    }

 
    const existingCoupon = await Coupons.findOne({ coupon_id });

    if (!existingCoupon) {
      return { success: false, error: "Coupon not found" };
    }

  
    if (updatedData.coupon_title) {
      const existingTitle = await Coupons.findOne({
        coupon_title: updatedData.coupon_title,
        coupon_id: { $ne: coupon_id },
      });

      if (existingTitle) {
        return {
          success: false,
          error: "This Coupon Title already exists",
        };
      }
    }

    if (updatedData.coupon_code) {
      const existingCode = await Coupons.findOne({
        coupon_code: updatedData.coupon_code,
        coupon_id: { $ne: coupon_id },
      });

      if (existingCode) {
        return {
          success: false,
          error: "This Coupon Code already exists",
        };
      }
    }

    const { user_name, coupon_id: _ignoreId, ...fieldsToUpdate } = updatedData;

    if (updatedData.users_type === "all") {
      (fieldsToUpdate as any).user_name = [];
      (fieldsToUpdate as any).users_type = "all";
    } else if (updatedData.users_type === "individual") {
      (fieldsToUpdate as any).users_type = "individual";

      if (Array.isArray(user_name)) {
        (fieldsToUpdate as any).user_name = user_name;
      }
    }

  
    const updatedCoupon = await Coupons.findOneAndUpdate(
      { coupon_id },
      { $set: fieldsToUpdate },
      { new: true }
    )
      .populate("user_name.user_name")
      .lean();

    if (!updatedCoupon) {
      return { success: false, error: "Coupon not found after update" };
    }


    revalidatePath("/coupon");

    return {
      success: true,
      coupon: JSON.parse(JSON.stringify(updatedCoupon)),
    };
  } catch (error: any) {
    console.error("Error updating Coupon:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}


export async function updateCouponStatus({
  coupon_id,
  status,
}: {
  coupon_id: string;
  status: boolean;
}) {
  try {
    if (!coupon_id) {
      return { success: false, message: "coupon ID is required" };
    }

    await connectToDataBase();

    const existing = await Coupons.findOne({ coupon_id });

    if (!existing) {
      return { success: false, message: "Coupon not found" };
    }

    existing.status = status;

    const updatedCoupon = await existing.save();
    revalidatePath("/coupon");

    return {
      success: true,
      message: "coupon status updated successfully",
      data: JSON.parse(JSON.stringify(updatedCoupon)),
    };
  } catch (error) {
    console.error("Error updating Coupon status:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function deleteCoupon(coupon_id: string) {
  try {
    if (!coupon_id) {
      return { success: false, message: "Coupon ID is required" };
    }

    await connectToDataBase();

    const product = await Coupons.findOne({ coupon_id });

    if (!product) {
      return { success: false, message: "Coyupon not found" };
    }

    await Coupons.deleteOne({ coupon_id });

    revalidatePath("/coupon");

    return { success: true, message: "coupon deleted successfully" };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, message: "Internal server error" };
  }
}