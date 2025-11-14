"use server"
import connectToDataBase from "@/db";
import Customers from "@/models/Customers";
import { generateCustomId } from "@/utils/generateCustomId";
import { revalidatePath } from "next/cache";


export async function createCustomer(data: any) {
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
    return { success: true, user: JSON.parse(JSON.stringify(savedUser)) };
  } catch (error: any) {
    console.error("Error creating User:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}