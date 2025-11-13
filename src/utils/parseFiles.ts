"use server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export async function parseImage(component_image: File) {
  const arrayBuffer = await component_image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempDir = os.tmpdir();
  const uniqueFileName = uuidv4();
  const ext = component_image.name.split(".").pop() || "jpg"; // Default to jpg
  const tempFilePath = path.join(tempDir, `${uniqueFileName}.${ext}`);

  await fs.writeFile(tempFilePath, buffer);

  return tempFilePath;
}
