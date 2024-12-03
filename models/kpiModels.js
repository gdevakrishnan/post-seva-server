const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema({
    postalCode: { type: String, required: true },
    region: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    national: { type: String, required: true },
    onTimeDeliveries: { type: Number, required: true },
    totalDeliveries: { type: Number, required: true },
    waitTime: { type: Number, required: true },
    customers: { type: Number, required: true },
    complaintsResolved: { type: Number, required: true },
    complaintsReceived: { type: Number, required: true },
    successfulDeliveries: { type: Number, required: true },
    deliveryAttempts: { type: Number, required: true },
    accurateNotifications: { type: Number, required: true },
    totalNotifications: { type: Number, required: true },
    satisfactionRatings: { type: [Number], required: true },
    escalatedComplaints: { type: Number, required: true },
    uptime: { type: Number, required: true },
    scheduledTime: { type: Number, required: true },
    resolutionTime: { type: Number, required: true },
    resolvedComplaints: { type: Number, required: true },
    activeUsers: { type: Number, required: true },
    registeredUsers: { type: Number, required: true },
});

module.exports = mongoose.model("KPI", kpiSchema);
