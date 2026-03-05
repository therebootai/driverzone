import { deleteFile, uploadFile } from "./cloudinary";
import { parseImage } from "./parseFiles";
import fs from "fs/promises";

export const handleImageUpload = async (file: File, oldPublicId?: string) => {
  // Parse image
  const tempFilePath = await parseImage(file);

  // Upload to Cloudinary
  const uploadResult = await uploadFile(tempFilePath, file.type);

  if (uploadResult instanceof Error) {
    throw new Error("Image upload failed");
  }

  // Delete old image if exists
  if (oldPublicId) {
    await deleteFile(oldPublicId);
  }

  // Clean up temp file
  await fs.unlink(tempFilePath).catch(console.error);

  return {
    public_id: uploadResult.public_id,
    secure_url: uploadResult.secure_url,
  };
};
