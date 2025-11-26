"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "./jwt";

export async function authorizeAccess(page: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      redirect("/");
    }

    const user = await verifyToken(token.value);

    if (!user) {
      cookieStore.delete("token");
      redirect("/");
    }
    if (user.role === "Admin") {
      return true;
    } else if (user.by_access.includes(page.toLowerCase())) {
      return true;
    } else {
      redirect("/admin/dashboard");
    }
  } catch (error) {
    console.error("Error authorizing access:", error);
    redirect("/");
  }
}
