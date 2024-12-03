const KPI = require('../models/kpiModels');

// Utility function to calculate KPIs
const calculateKPIs = (data) => ({
    onTimeDeliveryRate: 
        (data.reduce((sum, item) => sum + item.onTimeDeliveries, 0) / 
        data.reduce((sum, item) => sum + item.totalDeliveries, 0)) * 100 || 0,
    averageCustomerWaitTime: 
        data.reduce((sum, item) => sum + item.waitTime, 0) / 
        data.reduce((sum, item) => sum + item.customers, 0) || 0,
    complaintResolutionRate: 
        (data.reduce((sum, item) => sum + item.complaintsResolved, 0) / 
        data.reduce((sum, item) => sum + item.complaintsReceived, 0)) * 100 || 0,
    deliverySuccessRate: 
        (data.reduce((sum, item) => sum + item.successfulDeliveries, 0) / 
        data.reduce((sum, item) => sum + item.deliveryAttempts, 0)) * 100 || 0,
    notificationAccuracy: 
        (data.reduce((sum, item) => sum + item.accurateNotifications, 0) / 
        data.reduce((sum, item) => sum + item.totalNotifications, 0)) * 100 || 0,
    customerSatisfactionIndex: 
        data.reduce((sum, item) => sum + item.satisfactionRatings.reduce((a, b) => a + b, 0), 0) / 
        data.reduce((sum, item) => sum + item.satisfactionRatings.length, 0) || 0,
    escalationRate: 
        (data.reduce((sum, item) => sum + item.escalatedComplaints, 0) / 
        data.reduce((sum, item) => sum + item.complaintsReceived, 0)) * 100 || 0,
    serviceAvailability: 
        (data.reduce((sum, item) => sum + item.uptime, 0) / 
        data.reduce((sum, item) => sum + item.scheduledTime, 0)) * 100 || 0,
    meanTimeToResolution: 
        data.reduce((sum, item) => sum + item.resolutionTime, 0) / 
        data.reduce((sum, item) => sum + item.resolvedComplaints, 0) || 0,
    engagementRate: 
        (data.reduce((sum, item) => sum + item.activeUsers, 0) / 
        data.reduce((sum, item) => sum + item.registeredUsers, 0)) * 100 || 0,
});

// Add KPI data
const addKPI = async (req, res) => {
    try {
        const { postalCode, region, district, state, national } = req.body;

        // Validate required fields
        if (!postalCode || !region) {
            return res.status(400).json({
                success: false,
                message: "Both postalCode and region are required",
            });
        }

        // Convert string fields to lowercase and replace spaces with '-'
        const formatString = (str) => {
            return str ? str.toLowerCase().replace(/\s+/g, '-') : str;
        };

        // Format all string fields except postalCode
        req.body.region = formatString(region);
        req.body.district = formatString(district);
        req.body.state = formatString(state);
        req.body.national = formatString(national);

        // Check if the postalCode and region already exist
        const existingKPI = await KPI.findOne({ postalCode, region: req.body.region });
        if (existingKPI) {
            return res.status(400).json({
                success: false,
                message: "KPI with the same postalCode and region already exists",
            });
        }

        // Create and save the new KPI
        const newKPI = new KPI(req.body);
        await newKPI.save();

        res.status(201).json({
            success: true,
            message: "KPI added successfully",
            data: newKPI,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all KPIs
const getAllKPIs = async (req, res) => {
    try {
        const kpis = await KPI.find();
        res.status(200).json({ success: true, message: "All KPIs retrieved", data: kpis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get KPIs by region
const getKPIByRegion = async (req, res) => {
    try {
        const kpis = await KPI.find({ region: req.params.region });
        res.status(200).json({ success: true, message: "KPIs by region retrieved", data: kpis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get KPIs by level
const getKPIsByLevel = async (req, res) => {
    try {
        const kpis = await KPI.find({ [req.params.level]: req.params.identifier });
        const kpiResults = calculateKPIs(kpis);
        res.status(200).json({ success: true, message: "KPIs calculated", data: kpiResults });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update KPI by postal code
const updateKPIFieldByPostalCode = async (req, res) => {
    try {
        const updatedKPI = await KPI.findOneAndUpdate(
            { postalCode: req.params.postalCode },
            { $set: req.body },
            { new: true }
        );
        res.status(200).json({ success: true, message: "KPI updated", data: updatedKPI });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addKPI, getAllKPIs, getKPIByRegion, getKPIsByLevel, updateKPIFieldByPostalCode };
