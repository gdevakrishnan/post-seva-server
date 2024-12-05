const mongoose = require('mongoose');

// Define the Package Schema
const packageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId, // Refers to the user (Postman or sender)
      required: true,
      ref: 'Postman', // Reference to the Postman model
    },
    fromUserName: {
      type: String,
      required: true,
      trim: true,
    },
    fromPhNo: {
      type: String,
      required: true,
      trim: true,
    },
    fromAddress: {
      type: String,
      required: true,
      trim: true,
    },
    toUserName: {
      type: String,
      required: true,
      trim: true,
    },
    toPhNo: {
      type: String,
      required: true,
      trim: true,
    },
    toAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['In Transit', 'Delivered', 'Pending'], // Define statuses
      default: 'Pending',
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Package model
const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
