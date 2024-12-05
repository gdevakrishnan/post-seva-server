const Package = require('../models/packageModels');
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Create a new package
const createPackage = async (req, res) => {
    const { fromUserId, fromUserName, fromPhNo, fromAddress, toUserName, toPhNo, toAddress } = req.body;

    try {
        const newPackage = await Package.create({
            fromUserId,
            fromUserName,
            fromPhNo,
            fromAddress,
            toUserName,
            toPhNo,
            toAddress,
        });

        res.status(201).json({
            message: 'Package created successfully',
            package: newPackage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all packages for a specific sender (based on fromUserId)
const getPackagesByUser = async (req, res) => {
    const { fromUserId } = req.params;

    try {
        const packages = await Package.find({ fromUserId });
        res.status(200).json({ packages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the status of a package
const updatePackageStatus = async (req, res) => {
    const { packageId } = req.params;
    const { status } = req.body;

    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            { status },
            { new: true } // Return the updated package
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({
            message: 'Package status updated successfully',
            package: updatedPackage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a package (optional)
const deletePackage = async (req, res) => {
    const { packageId } = req.params;

    try {
        const deletedPackage = await Package.findByIdAndDelete(packageId);

        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({
            message: 'Package deleted successfully',
            package: deletedPackage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assuming you already have the necessary imports, such as the Package model

// Get a package by its ID
const getPackageById = async (req, res) => {
    const { packageId } = req.params;

    try {
        // Fetch the package details using the packageId
        const package = await Package.findById(packageId);

        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({
            packageId: package._id,
            fromUserId: package.fromUserId,
            fromUserName: package.fromUserName,
            fromPhNo: package.fromPhNo,
            fromAddress: package.fromAddress,
            toUserName: package.toUserName,
            toPhNo: package.toPhNo,
            toAddress: package.toAddress,
            status: package.status,
            createdAt: package.createdAt,
            updatedAt: package.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Pickup Package Controller
const pickupPackage = async (req, res) => {
    const { packageId } = req.body;
  
    try {
      // Find the package by its ID
      const package = await Package.findById(packageId);
  
      if (!package) {
        return res.status(404).json({ message: 'Package not found' });
      }
  
      // Send SMS to both sender and receiver
      const senderMessage = `Your package (ID: ${package._id}) has been picked up by the delivery man.`;
      const receiverMessage = `The package you are expecting (ID: ${package._id}) has been picked up for delivery.`;
  
      // Send message to the sender
      await client.messages.create({
        body: senderMessage,
        from: process.env.TWILIO_MOBILE_NUMBER,
        to: package.fromPhNo,
      });
  
      // Send message to the receiver
      await client.messages.create({
        body: receiverMessage,
        from: process.env.TWILIO_MOBILE_NUMBER,
        to: package.toPhNo,
      });
  
      res.status(200).json({
        message: 'Pickup acknowledged, messages sent to sender and receiver.',
        packageId: package._id,
        fromUser: package.fromUserName,
        toUser: package.toUserName,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    createPackage,
    getPackagesByUser,
    updatePackageStatus,
    deletePackage,
    getPackageById,
    pickupPackage
};
