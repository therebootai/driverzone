"use server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (tempFilePath: string, fileType: string) => {
  try {
    let folderName = "images";
    let format = "jpg";
    let resourceType: "image" | "video" = "image";

    if (fileType.startsWith("video/")) {
      folderName = "videos";
      format = "mp4";
      resourceType = "video";
    }

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: `${process.env.CLOUDINARY_FOLDER_NAME}/` + folderName,
      resource_type: resourceType,
      format: format,
    });

    return result; // Return the result of the upload
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Error("File upload failed");
  }
};

export const deleteFile = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file:", error);
    return new Error("File deletion failed");
  }
};
