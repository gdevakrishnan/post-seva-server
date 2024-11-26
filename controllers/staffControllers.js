const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/staffModels');
require('dotenv').config();

const { SECRET_KEY } = process.env;

// Register a new account
const staffRegister = async (req, res) => {
    try {
        const { userId, postalCode, fullName, password } = req.body;

        // Check if userId is already taken
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            userId,
            postalCode,
            fullName,
            password: hashedPassword,
        });

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

// Login account
const staffLogin = async (req, res) => {
    try {
        const { userId, postalCode, password } = req.body;

        // Find the user by userId and postalCode
        const user = await User.findOne({ userId, postalCode });
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.userId, postalCode: user.postalCode }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token: `Bearer ${token}` });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

// Check if userId is available
const checkUserId = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ userId });
        const isAvailable = !user; // If user is null, the ID is available

        return res.status(200).json({
            message: isAvailable ? 'User ID is available' : 'User ID already taken',
            isAvailable, // Return the availability as a boolean
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};


// Verify JWT token and return user data
const verifyToken = async (req, res) => {
    const { token } = req.body; // Bearer token is sent in the request body

    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }

    try {
        // Extract the token from the body
        const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        
        if (!actualToken || actualToken.split('.').length !== 3) {
            return res.status(400).json({ error: "Invalid token format" });
        }

        // Verify the token using the SECRET_KEY
        const user = await jwt.verify(actualToken, SECRET_KEY);

        // Send the user details
        res.status(200).json({
            data: user, message: "Verified User"
        });
    } catch (e) {
        console.error("Token verification error:", e.message);
        res.status(400).json({ message: "Invalid token", error: e.message });
    }
};

module.exports = { staffRegister, staffLogin, checkUserId, verifyToken }