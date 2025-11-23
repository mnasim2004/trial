require("dotenv").config();
const { S3 } = require("aws-sdk");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;

// Configure S3 client with credentials from environment
const client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

exports.s3Upload = async (files) => {
  // Check if AWS credentials are configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET_NAME in your .env file. See AWS_SETUP_GUIDE.md for instructions.");
  }

  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  var keys = "";
  const params = files.map((file) => {
    keys = `products/${uuid()}-${file.originalname}`;
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: keys,
      Body: file.buffer,
    };
  });
  
  try {
    await Promise.all(
      params.map((param) => client.send(new PutObjectCommand(param))),
    );
    return keys;
  } catch (error) {
    console.error("S3 Upload Error:", error.message);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

exports.s3Upload2 = async (files) => {
  // Check if AWS credentials are configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET_NAME in your .env file. See AWS_SETUP_GUIDE.md for instructions.");
  }

  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  var keys = "";
  const params = files.map((file) => {
    keys = `user/${uuid()}-${file.originalname}`;
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: keys,
      Body: file.buffer,
    };
  });
  
  try {
    await Promise.all(
      params.map((param) => client.send(new PutObjectCommand(param))),
    );
    return keys;
  } catch (error) {
    console.error("S3 Upload Error:", error.message);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};
