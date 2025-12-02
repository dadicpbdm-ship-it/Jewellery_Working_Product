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

module.exports = router;
