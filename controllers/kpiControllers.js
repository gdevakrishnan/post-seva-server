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

// Update operations of a post office by postalCode
const updatePostOfficeOperations = async (req, res) => {
  try {
    const { postalCode } = req.params; // Get postalCode from the request params
    const updatedOperations = req.body; // Updated operations from the request body

    // Validate if `updatedOperations` is provided
    if (!updatedOperations || Object.keys(updatedOperations).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update values provided.',
      });
    }

    // Find and update operations
    const updatedKPI = await KPI.findOneAndUpdate(
      { postalCode },
      { $set: { operations: { ...updatedOperations } } }, // Update the operations field
      { new: true, runValidators: true }
    );

    if (!updatedKPI) {
      return res.status(404).json({
        success: false,
        message: `No post office found with postalCode: ${postalCode}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Operations updated for postalCode: ${postalCode}`,
      data: updatedKPI,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get KPI data by postalCode
const getKPIByPostalCode = async (req, res) => {
  try {
    const { postalCode } = req.params; // Get postalCode from the request params

    // Fetch KPI data
    const kpiData = await KPI.findOne({ postalCode });

    if (!kpiData) {
      return res.status(404).json({
        success: false,
        message: `No KPI data found for postalCode: ${postalCode}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `KPI data retrieved for postalCode: ${postalCode}`,
      data: kpiData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const ComplaintTrackerModel = require('../controllers/userControllers');

// Controller to update or create complaint tracker data
const updateOrCreateComplaintTracker = async (req, res) => {
  try {
    const { postalOfficeCode, region, district, state, national, posts, complaints, customer } = req.body;

    // Check if a document with the given postalOfficeCode exists
    let tracker = await ComplaintTrackerModel.findOne({ postalOfficeCode });

    if (tracker) {
      // Update the existing document
      tracker.region = region || tracker.region;
      tracker.district = district || tracker.district;
      tracker.state = state || tracker.state;
      tracker.national = national || tracker.national;

      if (posts) {
        posts.forEach(post => {
          const existingPost = tracker.posts.find(p => new Date(p.date).toISOString() === new Date(post.date).toISOString());
          if (existingPost) {
            Object.assign(existingPost, post);
          } else {
            tracker.posts.push(post);
          }
        });
      }

      if (complaints) {
        complaints.forEach(complaint => {
          const existingComplaint = tracker.complaints.find(c => new Date(c.date).toISOString() === new Date(complaint.date).toISOString());
          if (existingComplaint) {
            Object.assign(existingComplaint, complaint);
          } else {
            tracker.complaints.push(complaint);
          }
        });
      }

      if (customer) {
        customer.forEach(cust => {
          const existingCustomer = tracker.customer.find(c => new Date(c.date).toISOString() === new Date(cust.date).toISOString());
          if (existingCustomer) {
            existingCustomer.feedback = cust.feedback;
          } else {
            tracker.customer.push(cust);
          }
        });
      }

      await tracker.save();
      return res.status(200).json({ message: 'Data updated successfully', tracker });
    } else {
      tracker = new ComplaintTrackerModel({
        postalOfficeCode,
        region,
        district,
        state,
        national,
        posts,
        complaints,
        customer
      });

      await tracker.save();
      return res.status(201).json({ message: 'Data created successfully', tracker });
    }
  } catch (error) {
    console.error('Error updating or creating data:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};


module.exports = { addKPI, getAllKPIs, getKPIByRegion, getKPIsByLevel, updateKPIFieldByPostalCode, updatePostOfficeOperations, getKPIByPostalCode, updateOrCreateComplaintTracker, updateOrCreateComplaintTracker };

