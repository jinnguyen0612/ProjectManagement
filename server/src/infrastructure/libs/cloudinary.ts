import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { env } from "../configs/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Upload file từ buffer
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, public_id: randomUUID(), resource_type: resourceType },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      )
      .end(buffer);
  });
};

// Xóa file theo publicId
export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

// Lấy URL đã tối ưu
export const getOptimizedUrl = (publicId: string, width?: number, height?: number) => {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...(width && height && { width, height, crop: "auto", gravity: "auto" }),
  });
};

export default cloudinary;