const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Postman Schema
const postmanSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  postofficeCode: {
    type: String, // Use String type for number-like values
    required: true,
    trim: true,
    match: /^[0-9]+$/, // Ensures the value contains only numeric characters
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Hash the password before saving the user
postmanSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
postmanSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the Postman model
const Postman = mongoose.model('Postman', postmanSchema);

module.exports = Postman;
