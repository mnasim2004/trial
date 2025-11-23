/**
 * ImgBB Image Upload Service
 * Free image hosting - no complex setup required!
 * Get API key from: https://api.imgbb.com/
 */

require("dotenv").config();
const FormData = require("form-data");
const axios = require("axios");
const uuid = require("uuid").v4;

/**
 * Upload images to ImgBB
 * @param {Array} files - Array of file objects from multer
 * @param {String} folder - Folder name (products or user)
 * @returns {String} - Image URL or comma-separated URLs
 */
exports.imgbbUpload = async (files, folder = "products") => {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "IMGBB_API_KEY not configured. Get a free API key from https://api.imgbb.com/ and add it to your .env file."
    );
  }

  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  try {
    const uploadPromises = files.map(async (file) => {
      // Convert buffer to base64
      const base64Image = file.buffer.toString("base64");
      
      // ImgBB API expects form data with key and image (base64)
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("image", base64Image);

      const response = await axios.post("https://api.imgbb.com/1/upload", formData, {
        headers: formData.getHeaders(),
      });

      if (response.data && response.data.success && response.data.data && response.data.data.url) {
        return response.data.data.url;
      } else {
        throw new Error("ImgBB upload failed: Invalid response");
      }
    });

    const urls = await Promise.all(uploadPromises);
    
    // Return single URL or comma-separated URLs (matching S3 behavior)
    return urls.length === 1 ? urls[0] : urls.join(",");
  } catch (error) {
    console.error("ImgBB Upload Error:", error.message);
    if (error.response) {
      throw new Error(`ImgBB upload failed: ${error.response.data?.error?.message || error.message}`);
    }
    throw new Error(`ImgBB upload failed: ${error.message}`);
  }
};

