const { Schema, default: mongoose } = require("mongoose");

const complaintSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
        },
        service: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        complaintNumber: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            default: null,
        },
        complaintDate: {
            type: Date,
            default: null,
        },
        complaintOffice: {
            type: String,
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
        supportingDocuments: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['review', 'accepted', 'closed', 'rejected'],
            default: 'review',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        feedbacks: [
            {
                feedback: {
                    type: String,
                    required: true,
                },
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        staff: { type: String },
        tracking: [
            {
                name: { type: String, required: true },
                date: { type: Date, required: true }
            }
        ],
    },
    { timestamps: true }
);


const userModel = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phNo: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        lat: {
            type: Number,
            required: true,
        },
        lon: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            default: "staff",
            required: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userModel, "Users");
const Complaints = mongoose.model("Complaints", complaintSchema, "Complaints");

module.exports = { User, Complaints };