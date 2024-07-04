const mongoose = require("mongoose");

// Define schema
const trialSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
    required: true,
  },
  productUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who owns the product
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"], // Status can be one of these values
    default: "Pending", // Default status is pending
  },
});

// Create model
const Trial = mongoose.model("Trial", trialSchema);

module.exports = Trial;
