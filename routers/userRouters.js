const express = require('express');
const { sendOtp, verifyOtp, cronJob, updateUser } = require('../controllers/userControllers');
const routers = express.Router();

routers.post('/send_otp', sendOtp);
routers.post('/verify_otp', verifyOtp);
routers.post('/update_user', updateUser);
routers.get('/cron_job', cronJob);

module.exports = ("userRouters", routers);