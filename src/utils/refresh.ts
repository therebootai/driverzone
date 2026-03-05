"use server";

import { revalidatePath } from "next/cache";

export async function REFRESH(pathName: string) {
  revalidatePath(pathName);
}
