import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with explicit config
const configureCloudinary = () => {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log("☁️ Cloudinary configured:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    });
  }
};

/**
 * Upload audio file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder (default: "dhvny/audio")
 * @returns {Promise<object>} - Upload result with url, public_id, duration, etc.
 */
export const uploadAudioToCloudinary = async (
  filePath,
  folder = "dhvny/audio"
) => {
  try {
    // Ensure Cloudinary is configured
    configureCloudinary();

    console.log("📤 Uploading to Cloudinary:", {
      filePath,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video", // Cloudinary uses 'video' for audio files
      folder: folder,
    });

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error details:", {
      message: error.message,
      stack: error.stack,
      error: error,
    });
    // Clean up local file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary audio upload failed: ${error.message}`);
  }
};

/**
 * Upload image file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder (default: "dhvny/covers")
 * @returns {Promise<object>} - Upload result with url, public_id, etc.
 */
export const uploadImageToCloudinary = async (
  filePath,
  folder = "dhvny/covers"
) => {
  try {
    // Ensure Cloudinary is configured
    configureCloudinary();

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: folder,
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto:good",
        },
      ],
    });

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    // Clean up local file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary image upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - 'image' or 'video' (for audio)
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "video"
) => {
  try {
    // Ensure Cloudinary is configured
    configureCloudinary();

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export default cloudinary;
