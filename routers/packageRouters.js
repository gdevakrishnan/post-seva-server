const express = require('express');
const router = express.Router();
const {
  createPackage,
  getPackagesByUser,
  getPackageById,
  updatePackageStatus,
  deletePackage,
  pickupPackage, // Import the pickupPackage controller
} = require('../controllers/packageControllers');

// Route to create a package
router.post('/', createPackage);

// Route to get all packages for a specific sender
router.get('/user/:fromUserId', getPackagesByUser);

// Route to get a package by its ID
router.get('/:packageId', getPackageById);

// Route to update the status of a package
router.patch('/:packageId/status', updatePackageStatus);

// Route to delete a package
router.delete('/:packageId', deletePackage);

// Route to pickup a package and notify sender and receiver
router.post('/pickup', pickupPackage);  // New route for pickup package

module.exports = router;
