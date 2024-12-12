const express = require('express');
const {
    getKPIsByLevel,
    addKPI,
    getAllKPIs,
    getKPIByRegion,
    updateKPIFieldByPostalCode,
    updatePostOfficeOperations,
    getKPIByPostalCode,
    updateOrCreateComplaintTracker
} = require('../controllers/kpiControllers');
const ComplaintTrackerModel = require('../models/kpiModels');
const router = express.Router();

// Routes

// Route to add a KPI
router.post("/add", addKPI);

// Route to get all KPIs
router.get("/all", getAllKPIs);

// Route to get KPIs by region
router.get("/region/:region", getKPIByRegion);

// Route to get KPIs by level and identifier
router.get("/level/:level/:identifier", getKPIsByLevel);

// Route to update a KPI field by postal code
router.put("/update/:postalCode", updateKPIFieldByPostalCode);

// Route to update operations of a post office
router.post('/kpi/postalCode/:postalCode/operations', updatePostOfficeOperations);

// Route to get KPI by postalCode
router.get('/kpi/postalCode/:postalCode', getKPIByPostalCode);

// Route to update or create complaint tracker data
router.post('/update-or-create', updateOrCreateComplaintTracker);

// Route to get all KPI data
router.get('/all-data', async (req, res) => {
    try {
        const allData = await ComplaintTrackerModel.find();
        res.status(200).json({ message: 'All data fetched successfully', data: allData });
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;
