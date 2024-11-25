const express = require('express');
const { sendOtp, verifyOtp, cronJob, updateUser, verifyToken } = require('../controllers/userControllers');
const routers = express.Router();

routers.post('/send-otp', sendOtp);
routers.post('/verify-otp', verifyOtp);
routers.post('/update-user', updateUser);
routers.get('/cron-job', cronJob);
routers.get('/verify-token', verifyToken);

module.exports = ("userRouters", routers);