const jwt = require('jsonwebtoken');
const Postman = require('../models/postmanModels');

// Helper function to create a token with postmanId, username, and email
const generateToken = (postmanId, username, email, postofficeCode) => {
  return jwt.sign(
    { id: postmanId, username, email, postofficeCode }, // Include all fields in the payload
    process.env.SECRET_KEY,            // Use your secret key from the .env file
    { expiresIn: process.env.EXPIRY_TIME } // Set expiration time
  );
};

// Register Controller
const registerPostman = async (req, res) => {
  const { username, email, password, postofficeCode } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await Postman.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // Create a new user
    const newPostman = await Postman.create({ username, email, password, postofficeCode });

    if (newPostman) {
      res.status(201).json({
        message: 'Postman registered successfully',
        postmanId: newPostman._id,
        username: newPostman.username,
        email: newPostman.email,
        postofficeCode: newPostman.postofficeCode,
      });
    } else {
      res.status(400).json({ message: 'Failed to register postman' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Controller
const loginPostman = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const postman = await Postman.findOne({ username });
    if (!postman) {
      return res.status(404).json({ message: 'Postman not found' });
    }

    // Verify the password
    const isPasswordMatch = await postman.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token with postmanId, username, email, and postofficeCode
    const token = generateToken(postman._id, postman.username, postman.email, postman.postofficeCode);

    res.status(200).json({
      postmanId: postman._id,
      token,
      postofficeCode: postman.postofficeCode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Token Controller
const verifyToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch the user's data using the decoded fields
    const postman = await Postman.findById(decoded.id).select('-password'); // Exclude password for security

    if (!postman) {
      return res.status(404).json({ message: 'Postman not found' });
    }

    // Return the decoded data and additional user information
    res.status(200).json({
      message: 'Token is valid',
      postman: {
        postmanId: postman._id,
        username: decoded.username, // Directly use decoded username
        email: decoded.email,       // Directly use decoded email
        postofficeCode: decoded.postofficeCode, // Directly use decoded postofficeCode
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  registerPostman,
  loginPostman,
  verifyToken
};
