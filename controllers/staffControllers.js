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
        const token = jwt.sign({ userId: user.userId }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
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
    try {
        const token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Find user by userId
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Token verified', user });
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error });
    }
};

module.exports = { staffRegister, staffLogin, checkUserId, verifyToken }