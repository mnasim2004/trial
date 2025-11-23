/**
 * Unified Upload Service
 * Supports both ImgBB (default, free) and AWS S3 (switchable)
 * Set IMAGE_UPLOAD_SERVICE=imgbb or IMAGE_UPLOAD_SERVICE=aws in .env
 */

require("dotenv").config();

const UPLOAD_SERVICE = process.env.IMAGE_UPLOAD_SERVICE || "imgbb"; // Default to ImgBB

// Upload function for products
const uploadProductImage = async (files) => {
  if (UPLOAD_SERVICE === "imgbb") {
    const { imgbbUpload } = require("./imgbbService");
    return await imgbbUpload(files, "products");
  } else if (UPLOAD_SERVICE === "aws") {
    const { s3Upload } = require("./s3Service");
    return await s3Upload(files);
  } else {
    throw new Error(`Invalid IMAGE_UPLOAD_SERVICE: ${UPLOAD_SERVICE}. Use 'imgbb' or 'aws'`);
  }
};

// Upload function for user profiles
const uploadUserImage = async (files) => {
  if (UPLOAD_SERVICE === "imgbb") {
    const { imgbbUpload } = require("./imgbbService");
    return await imgbbUpload(files, "user");
  } else if (UPLOAD_SERVICE === "aws") {
    const { s3Upload2 } = require("./s3Service");
    return await s3Upload2(files);
  } else {
    throw new Error(`Invalid IMAGE_UPLOAD_SERVICE: ${UPLOAD_SERVICE}. Use 'imgbb' or 'aws'`);
  }
};

module.exports = {
  uploadProductImage,
  uploadUserImage,
  UPLOAD_SERVICE, // Export for debugging
};

