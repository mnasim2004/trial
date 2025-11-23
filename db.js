const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const db = async () => {
  try {
    // Use environment variable if available, otherwise use hardcoded URI
    const mongo_uri = process.env.MONGO_URI ;
    
    if (mongo_uri) {
      await mongoose.connect(mongo_uri, {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000,
      });
      console.log("✅ Connected to MongoDB database");
    } else {
      console.error("❌ MongoDB URI is not defined");
    }
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    console.error("⚠️  App will continue running, but database features may not work");
    // Don't throw error, let the app continue
  }
};

module.exports = { db };
