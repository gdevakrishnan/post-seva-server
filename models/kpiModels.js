const { Schema } = require("mongoose");
const { default: mongoose } = require("mongoose");

const postSchema = new Schema({
    "date": { type: Date, required: true },
    "no_of_posts": { type: Number, required: true },
    "no_of_posts_deliver_on_time": { type: Number, required: true },
    "no_successfull_deliveries": { type: Number, required: true },
    "no_of_return_posts": { type: Number, required: true }
  });
  
  // Define the schema for the "complaints" array
  const complaintSchema = new Schema({
    "date": { type: Date, required: true },
    "no_of_complaints": { type: Number, required: true },
    "no_of_complaints_resolved": { type: Number, required: true },
    "no_of_complaints_esclated": { type: Number, required: true },
    "no_of_delivery_attempts": { type: Number, required: true },
    "time_to_resolve_all_complaints": { type: Number, required: true } // Time in milliseconds
  });
  
  // Define the schema for the "customer" array
  const customerSchema = new Schema({
    "date": { type: Date, required: true },
    "feedback": { type: [Number], required: true } // Array of numerical feedback
  });
  
  // Define the main schema for the complaint tracker data
  const complaintTrackerSchema = new Schema({
    "postalOfficeCode": { type: String, required: true },
    "region": { type: String, required: true },
    "district": { type: String, required: true },
    "state": { type: String, required: true },
    "national": { type: String, required: true },
    "posts": [postSchema],
    "complaints": [complaintSchema],
    "customer": [customerSchema]
  });
  
  // Create the model
  const ComplaintTrackerModel = mongoose.model('ComplaintTracker', complaintTrackerSchema);
  
  module.exports = ComplaintTrackerModel;
  