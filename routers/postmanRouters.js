const express = require('express');
const { registerPostman, loginPostman } = require('../controllers/postmanControllers');
const { verifyToken } = require('../controllers/postmanControllers');
const { getPostsByPostalCode } = require('../controllers/postControllers');

const router = express.Router();

// POST /register - Register a new postman
router.post('/register', registerPostman);

// POST /login - Login an existing postman
router.post('/login', loginPostman);

// POST /verify-token - Verify Bearer Token
router.post('/verify-token', verifyToken);

module.exports = router;