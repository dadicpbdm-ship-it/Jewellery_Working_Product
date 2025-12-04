const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getLoyaltyDashboard,
    getPointsHistory,
    redeemPoints,
    applyReferralCode,
    getTierInfo
} = require('../controllers/loyaltyController');

// Public routes
router.get('/tier-info', getTierInfo);

// Protected routes
router.get('/dashboard', protect, getLoyaltyDashboard);
router.get('/history', protect, getPointsHistory);
router.post('/redeem', protect, redeemPoints);
router.post('/apply-referral', protect, applyReferralCode);

// Calculate discount for points (used during checkout)
router.post('/calculate-discount', protect, async (req, res) => {
    try {
        const { points } = req.body;
        const loyaltyService = require('../services/loyaltyService');

        if (!points || points < 100) {
            return res.status(400).json({
                message: 'Minimum 100 points required for redemption'
            });
        }

        // Get user to validate they have enough points
        const User = require('../models/User');
        const user = await User.findById(req.user._id);

        if (!user || !user.loyalty || user.loyalty.points < points) {
            return res.status(400).json({
                message: 'Insufficient points'
            });
        }

        const discount = loyaltyService.calculatePointsDiscount(points);

        res.json({
            discount,
            points,
            availablePoints: user.loyalty.points
        });
    } catch (error) {
        console.error('Error calculating discount:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
