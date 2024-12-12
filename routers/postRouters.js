// postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postControllers");

// Define routes
router.post("/add-post", postController.addPost);
router.get("/:id", postController.getPostById);
router.patch("/:id/status", postController.updateStatus);
router.post("/:id/pickup-delivery", postController.pickupArticle);
router.post("/:id/deliver", postController.deliverArticle);

module.exports = router;