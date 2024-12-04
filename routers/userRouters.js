const express = require('express');
const {
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
    updateComplaintStatus,
    complaintTracking,
} = require('../controllers/userControllers');

const routers = express.Router();

// User-related routes
routers.post('/send-otp', sendOtp);
routers.post('/verify-otp', verifyOtp);
routers.post('/update-user', updateUser);
routers.post('/getuser', getUserById);
routers.post('/verify-token', verifyToken);

// Complaint-related routes
routers.post('/create-complaint', createComplaint); // Create a new complaint
routers.get('/get-all-complaints', getAllComplaints); // Get all complaints
routers.post('/get-complaint-by-id', getComplaintById); // Get a specific complaint by ID
routers.post('/create-feedback', createFeedback); // Create feedback for a complaint
routers.put('/update-status', updateComplaintStatus); // Update the status of the complaint
routers.put('/complaint-tracking', complaintTracking); // Add/update staff in complaint tracking

// General utility routes
routers.get('/cron-job', cronJob);

module.exports = routers;
