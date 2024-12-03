const express = require('express');
const { 
    getKPIsByLevel, 
    addKPI, 
    getAllKPIs, 
    getKPIByRegion, 
    updateKPIFieldByPostalCode 
} = require('../controllers/kpiControllers');
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

module.exports = router;
