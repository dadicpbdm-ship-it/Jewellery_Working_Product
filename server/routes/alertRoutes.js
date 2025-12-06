const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { productId, type, targetPrice, pincode, channels } = req.body;

        // Check if alert already exists
        const query = {
            user: req.user._id,
            product: productId,
            type,
            status: 'active'
        };

        if (pincode) query.pincode = pincode;

        const existingAlert = await Alert.findOne(query);

        if (existingAlert) {
            return res.status(400).json({ message: 'You already have an active alert for this product.' });
        }

        const alert = await Alert.create({
            user: req.user._id,
            product: productId,
            type,
            targetPrice,
            pincode,
            channels
        });

        // Send confirmation through all requested channels
        await notificationService.sendNotification(
            req.user,
            `Alert set for ${type}${pincode ? ` at ${pincode}` : ''}`,
            channels,
            { subject: 'Alert Confirmation' }
        );

        res.status(201).json(alert);
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get user's alerts
// @route   GET /api/alerts/my-alerts
// @access  Private
router.get('/my-alerts', protect, async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user._id })
            .populate('product', 'name imageUrl price countInStock')
            .sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete/Cancel an alert
// @route   DELETE /api/alerts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        if (alert.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await alert.deleteOne();
        res.json({ message: 'Alert removed' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
