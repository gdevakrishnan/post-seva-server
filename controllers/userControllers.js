const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels"); // Adjust the path as per your project
const crypto = require("crypto");
const twilio = require("twilio");

require('dotenv').config();

const { TWILIO_MOBILE_NUMBER, TWILIO_SID, TWILIO_AUTH_TOKEN, SECRET_KEY, EXPIRY_TIME } = process.env;

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
const otpStore = {};

const sendOtp = async (req, res) => {
    const { phNo } = req.body;

    if (!phNo) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    try {
        const otp = crypto.randomInt(100000, 999999);
        otpStore[phNo] = { otp, expiresAt: Date.now() + 2 * 60 * 1000 }; // Expires in 2 minutes

        await client.messages.create({
            body: `Post Seva\nYour OTP is ${otp}`,
            from: TWILIO_MOBILE_NUMBER,
            to: phNo,
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send OTP", details: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { phNo, otp } = req.body;

    if (!phNo || !otp) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
    }

    try {
        const storedOtp = otpStore[phNo];
        if (!storedOtp || storedOtp.otp !== parseInt(otp, 10)) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Remove the OTP after verification
        delete otpStore[phNo];

        // Check if the user exists
        let user = await User.findOne({ phNo });
        let userAlreadyExists = true;

        if (!user) {
            // If user does not exist, insert a new user
            userAlreadyExists = false;

            const result = await User.collection.insertOne({ phNo });
            user = { _id: result.insertedId };
        }

        // Generate a Bearer token
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: EXPIRY_TIME });

        console.log({
            userId: user._id,
            token: `Bearer ${token}`,
            userAlreadyExists,
        });
        

        // Return only the user ID, token, and existence status
        res.status(200).json({
            userId: user._id,
            token: `Bearer ${token}`,
            userAlreadyExists,
        });
    } catch (error) {
        res.status(500).json({ error: "OTP verification failed", details: error.message });
    }
};

// Update user
const updateUser = async (req, res) => {
    const { id, username, email, phNo, address, lat, lon } = req.body;

    console.log(username, email, phNo, address, lat, lon, id);
    

    if (!id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { username, email, phNo, address, lat, lon },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user", details: error.message });
    }
};


// Cron Job
const cronJob = async (req, res) => {
    res.status(200).json({message: "Running"});
}

module.exports = { sendOtp, verifyOtp, cronJob, updateUser };
