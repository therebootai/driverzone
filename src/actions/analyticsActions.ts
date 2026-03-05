"use server";

import connectToDatabase, { ensureModelsRegistered } from "@/db/connection";

export async function GET_ORDER_ANALYTICS_BY_DATES() {
  try {
    await connectToDatabase();
    await ensureModelsRegistered();
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch order analytics",
    };
  }
}
