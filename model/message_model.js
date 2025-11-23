const mongoose = require("mongoose");

// Define schema for messages/chat
const messageSchema = new mongoose.Schema({
  trialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trial", // Reference to the Trial model
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

// Create model
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;

