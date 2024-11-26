const express = require('express');
const { staffRegister, staffLogin, checkUserId, verifyToken } = require('../controllers/staffControllers');
const routers = express.Router();

// Routes
routers.post('/register', staffRegister);
routers.post('/login', staffLogin);
routers.post('/check-user-id', checkUserId);
routers.get('/staff-verify-token', verifyToken);

module.exports = ("staffRouters", routers);