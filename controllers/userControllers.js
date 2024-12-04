const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Complaints } = require("../models/userModels");
const crypto = require("crypto");
const twilio = require("twilio");
const { default: mongoose } = require("mongoose");

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
        otpStore[phNo] = { otp, expiresAt: Date.now() + 2 * 60 * 1000 };

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

// Get user details by ObjectId
const getUserById = async (req, res) => {
    const { userId } = req.body; // Extract userId from route params

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Find user by ObjectId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user,
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

// Update user
const updateUser = async (req, res) => {
    const { id, username, email, phNo, address, lat, lon } = req.body;

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

const createComplaint = async (req, res) => {
    try {
        const {
            category,
            service,
            type,
            complaintNumber,
            amount,
            complaintDate,
            complaintOffice,
            description,
            supportingDocuments,
            userId,
        } = req.body;

        if (!category || !service || !type || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newComplaint = {
            category,
            service,
            type,
            complaintNumber,
            amount,
            complaintDate: complaintDate ? new Date(complaintDate) : null,
            complaintOffice,
            description,
            supportingDocuments,
            userId: new mongoose.Types.ObjectId(userId),
            status: 'review',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await Complaints.collection.insertOne(newComplaint);

        res.status(201).json({
            message: "Complaint created successfully",
            complaintId: result.insertedId,
            complaint: { ...newComplaint, _id: result.insertedId },
        });
    } catch (error) {
        console.error("Error creating complaint:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// To get all the complaints
const getAllComplaints = async (req, res) => {
    try {
        // Fetch all complaints with the feedbacks field included
        const complaints = await Complaints.find().lean();

        if (!complaints.length) {
            return res.status(404).json({ message: "No complaints found" });
        }

        res.status(200).json({
            message: "Complaints retrieved successfully",
            complaints,
        });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// To get a complaint using ID
const getComplaintById = async (req, res) => {
    try {
        const { complaintId } = req.body;

        if (!complaintId) {
            return res.status(400).json({ message: "Complaint ID is required" });
        }

        // Fetch the complaint including the feedbacks array
        const complaint = await Complaints.findById(complaintId).lean();

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json({
            message: "Complaint retrieved successfully",
            complaint,
        });
    } catch (error) {
        console.error("Error fetching complaint:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};


const createFeedback = async (req, res) => {
    try {
        const { complaintId, feedback } = req.body;

        if (!complaintId || !feedback) {
            return res.status(400).json({ message: "Complaint ID and feedback are required" });
        }

        const complaint = await Complaints.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const feedbackData = {
            feedback: feedback,
            createdAt: new Date(),
        };

        const result = await Complaints.collection.updateOne(
            { _id: complaint._id },
            { $push: { feedbacks: feedbackData } }
        );

        res.status(200).json({
            message: "Feedback added successfully",
            complaintId: complaint._id,
            feedback: feedbackData,
        });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Update the status of the complaint
const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId, status } = req.body;

        if (!complaintId || !status) {
            return res.status(400).json({ message: "Complaint ID and status are required" });
        }

        const validStatuses = ['review', 'accepted', 'open', 'in_progress', 'closed', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const result = await Complaints.updateOne(
            { _id: complaintId },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json({
            message: "Complaint status updated successfully",
            complaintId,
            status,
        });
    } catch (error) {
        console.error("Error updating complaint status:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Cron Job
const cronJob = async (req, res) => {
    res.status(200).json({ message: "Running" });
}

module.exports = {
    sendOtp,
    verifyOtp,
    getUserById,
    cronJob,
    updateUser,
    verifyToken,
    createComplaint,
    getAllComplaints,
    getComplaintById,
    createFeedback,
    updateComplaintStatus
};