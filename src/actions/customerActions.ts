"use server"
import connectToDataBase, { ensureModelsRegistered } from "@/db/connection";
import Customers from "@/models/Customers";
import { customerTypes } from "@/types/types";
import { generateCustomId } from "@/utils/generateCustomId";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";


await ensureModelsRegistered();

export async function createCustomer(data: customerTypes) {
  try {
    await connectToDataBase();

    const existingMobileNumer = await Customers.findOne({
      mobile_number: data.mobile_number,
    });
    if (existingMobileNumer) {
      return { success: false, error: "This mobile number already exists" };
    }
    const existingEmail = await Customers.findOne({
      email: data.email,
    });
    if (existingEmail) {
      return { success: false, error: "This Email already exists" };
    }
    if (!data.customer_id) {
      data.customer_id = await generateCustomId(Customers, "customer_id", "customerId");
    }

    const newUser = new Customers(data);

    const savedUser = await newUser.save();

    revalidatePath("/customer-managment");
    return { success: true, customer: JSON.parse(JSON.stringify(savedUser)) };
  } catch (error: any) {
    console.error("Error creating User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}


/** Escape user input for safe regex usage */
function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


export async function getAllCustomers({
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
          { name: { $regex: term, $options: "i" } },
          { mobile_number: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
          { customer_id: { $regex: term, $options: "i" } },
        ],
      });
    }

    const query = andConditions.length ? { $and: andConditions } : {};

    const [allcustomers, totalCustomers] = await Promise.all([
      Customers.find(query, { password: 0 }) 
        .sort({ createdAt: -1 })
        .skip((_page - 1) * _limit)
        .limit(_limit)
        .lean(),
      Customers.countDocuments(query),
    ]);

     const serializedCustomer = JSON.parse(JSON.stringify(allcustomers));

    return {
      success: true,
      data: serializedCustomer,
      paginations: {
        totalPages: Math.ceil(totalCustomers / _limit),
        currentPage: _page,
        totalItems: totalCustomers,
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

export async function updateCustomer(
  customerIdOrObjectId: string,
  updates: customerTypes
) {
  try {
    await connectToDataBase();

    const byObjectId =
      mongoose.Types.ObjectId.isValid(customerIdOrObjectId)
        ? new mongoose.Types.ObjectId(customerIdOrObjectId)
        : undefined;

    const customer = await Customers.findOne({
      $or: [
        { customer_id: customerIdOrObjectId },
        { _id: byObjectId ?? undefined },
      ],
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }


    if (updates.email && updates.email !== customer.email) {
      const emailExists = await Customers.findOne({
        email: updates.email,
        _id: { $ne: customer._id },
      });
      if (emailExists) return { success: false, error: "This Email already exists" };
    }

    if (updates.mobile_number && updates.mobile_number !== customer.mobile_number) {
      const mobileExists = await Customers.findOne({
        mobile_number: updates.mobile_number,
        _id: { $ne: customer._id },
      });
      if (mobileExists)
        return { success: false, error: "This mobile number already exists" };
    }


    const allowed = [
      "name",
      "email",
      "mobile_number",
      "sos_mobile_number",
      "address",
      "total_spent",
      "password",
      "status",
    ] as const;
    type Allowed = typeof allowed[number];


    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([k, v]) => (allowed as readonly string[]).includes(k) && v !== undefined
      )
    ) as Partial<Record<Allowed, customerTypes[Allowed]>>;


    customer.set(filteredUpdates);

    const saved = await customer.save();

    const { password, ...obj } = saved.toObject();

    revalidatePath("/customer-managment");
    return { success: true, data: JSON.parse(JSON.stringify(obj)) };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}



export async function deleteCustomer(customerId: string) {
  try {
    await connectToDataBase();

    const deletedCustomer = await Customers.findOneAndDelete({
      $or: [
        { customer_id: customerId },
        {
          _id: mongoose.Types.ObjectId.isValid(customerId)
            ? new mongoose.Types.ObjectId(customerId)
            : undefined,
        },
      ],
    });

    if (!deletedCustomer) {
      return { success: false, error: "Customer not found" };
    }
  revalidatePath("/customer-managment");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting Customer:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
