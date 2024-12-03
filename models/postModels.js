const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    description: { type: String, required: true },
    mailer: { type: String, required: true }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    fromUserName: { type: String, required: true },
    fromAddress: { type: String, required: true },
    fromMobileNo: { type: String, required: true },
    toUserName: { type: String, required: true },
    toAddress: { type: String, required: true },
    toMobileNo: { type: String, required: true },
    tracking: { type: [trackingSchema], default: [] },
    status: {
        type: String,
        enum: ["not-dispatch", "progressing", "dispatched"],
        default: "not-dispatch",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
