const express = require('express');
const {
    addPost,
    addTrackingById,
    getPostById,
    updateStatusById,
    getPostsByMobileAndStatus
} = require('../controllers/postControllers');

const router = express.Router();

// Route to add a new post
router.post('/add', addPost);

// Route to add a tracking object by ObjectId
router.put('/tracking/:id', addTrackingById);

// Route to get a post by ObjectId
router.get('/get-post/:id', getPostById);

// Route to update post status by ObjectId
router.put('/status/:id', updateStatusById);

// Route to get posts by mobile number and status
router.get('/get-posts', getPostsByMobileAndStatus);

module.exports = router;
