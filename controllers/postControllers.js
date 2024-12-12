const Post = require("../models/postModels");
const twilio = require("twilio");
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_MOBILE_NUMBER } = process.env;
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// Add a new post
exports.addPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json({ message: "Post created successfully", id: newPost._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update post status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["not-dispatch", "progressing", "dispatched"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.status(200).json({ message: "Status updated successfully", post });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Pickup the article
exports.pickupArticle = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Send SMS to sender
        await client.messages.create({
            body: `Dear ${post.fromUserName}, your article has been picked up successfully!`,
            from: TWILIO_MOBILE_NUMBER,
            to: post.fromMobileNo,
        });

        // Send SMS to receiver
        await client.messages.create({
            body: `Dear ${post.toUserName}, your article is on the way!`,
            from: TWILIO_MOBILE_NUMBER,
            to: post.toMobileNo,
        });

        res.status(200).json({
            message: "Acknowledgment sent to both sender and receiver.",
            post,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deliver the article
exports.deliverArticle = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Generate a random OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Send OTP to the receiver
        await client.messages.create({
            body: `Dear ${post.toUserName}, your OTP for article delivery is ${otp}.`,
            from: TWILIO_MOBILE_NUMBER,
            to: post.toMobileNo,
        });

        // Acknowledge delivery to sender and receiver
        await client.messages.create({
            body: `Dear ${post.fromUserName}, article delivered! ID ${req.params.id}.`,
            from: TWILIO_MOBILE_NUMBER,
            to: post.fromMobileNo,
        });

        await client.messages.create({
            body: `Dear ${post.toUserName}, article successfully delivered! ID ${req.params.id}.`,
            from: TWILIO_MOBILE_NUMBER,
            to: post.toMobileNo,
        });

        res.status(200).json({
            message: "Delivery acknowledgment sent to both sender and receiver.",
            post,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller function to fetch a post by fromPostalCode
exports.getPostByPostalCode = async (req, res) => {
    try {
        // Get the fromPostalCode from the query parameters
        const { fromPostalCode } = req.params;

        // Validate if fromPostalCode is provided
        if (!fromPostalCode) {
            return res.status(400).json({ message: "fromPostalCode is required" });
        }

        // Find a post with the same fromPostalCode
        const post = await Post.findOne({ fromPostalCode });

        // If no post is found with that postal code
        if (!post) {
            return res.status(404).json({ message: "No post found with the given fromPostalCode" });
        }

        // Return the found post as response
        res.status(200).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all the posts
exports.getAllPosts = async (req, res) => {
    try {
        console.log("HI");
        
        const posts = await Post.find({});  // Get all posts
        if (posts.length === 0) {
            return res.status(404).json({ message: "No posts found" });
        }
        res.status(200).json(posts);  // Send all posts in the response
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
