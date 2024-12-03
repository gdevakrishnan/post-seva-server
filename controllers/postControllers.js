const Post = require('../models/postModels');

// Add a new post
const addPost = async (req, res) => {
    try {
        const postData = req.body;

        // Create a new Post instance
        const newPost = new Post(postData);
        
        // Save the new post to the database
        await newPost.save();

        res.status(201).json({
            success: true,
            message: 'Post added successfully',
            data: { objectId: newPost._id, ...newPost.toObject() }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding post',
            error: error.message
        });
    }
};

// Add a new tracking by ObjectId
const addTrackingById = async (req, res) => {
    const { id } = req.params;
    const trackingData = req.body;

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { $push: { tracking: trackingData } },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found with the given ObjectId'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tracking data added successfully',
            data: updatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding tracking data',
            error: error.message
        });
    }
};

// Get a post by ObjectId
const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found with the given ObjectId'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Post retrieved successfully',
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving post',
            error: error.message
        });
    }
};

// Update status by ObjectId
const updateStatusById = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Check if the status is valid
    if (!["not-dispatch", "progressing", "dispatched"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Status must be one of ["not-dispatch", "progressing", "dispatched"]'
        });
    }

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found with the given ObjectId'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Post status updated successfully',
            data: updatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating post status',
            error: error.message
        });
    }
};

// Get posts by mobile number and status
const getPostsByMobileAndStatus = async (req, res) => {
    const { mobileNo, status } = req.body; // Use req.query to fetch query params

    try {
        const query = {};

        if (mobileNo) {
            query.$or = [{ fromMobileNo: mobileNo }, { toMobileNo: mobileNo }];
        }
        if (status) {
            query.status = status;
        }

        const posts = await Post.find(query);

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No posts found for the given mobile number and status'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Posts retrieved successfully',
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving posts',
            error: error.message
        });
    }
};

module.exports = { addPost, addTrackingById, updateStatusById, getPostById, getPostsByMobileAndStatus };
