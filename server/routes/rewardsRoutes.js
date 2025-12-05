const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const RewardPoints = require('../models/RewardPoints');
const Order = require('../models/Order');

// @route   GET /api/rewards/balance
// @desc    Get user's reward points balance
// @access  Private
router.get('/balance', protect, async (req, res) => {
    try {
        let rewardPoints = await RewardPoints.findOne({ user: req.user.id });

        if (!rewardPoints) {
            // Create new record if doesn't exist
            rewardPoints = await RewardPoints.create({
                user: req.user.id,
                balance: 0,
                totalEarned: 0,
                totalRedeemed: 0,
                transactions: []
            });
        }

        res.json({
            balance: rewardPoints.balance,
            totalEarned: rewardPoints.totalEarned,
            totalRedeemed: rewardPoints.totalRedeemed
        });
    } catch (error) {
        console.error('Error fetching reward points:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/rewards/history
// @desc    Get user's reward points transaction history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const rewardPoints = await RewardPoints.findOne({ user: req.user.id })
            .populate('transactions.order', 'createdAt totalPrice');

        if (!rewardPoints) {
            return res.json({ transactions: [] });
        }

        res.json({
            transactions: rewardPoints.transactions.sort((a, b) => b.date - a.date)
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/rewards/validate-redemption
// @desc    Validate points redemption (called before order creation)
// @access  Private
router.post('/validate-redemption', protect, async (req, res) => {
    try {
        const { pointsToRedeem, orderTotal } = req.body;

        if (!pointsToRedeem || pointsToRedeem <= 0) {
            return res.status(400).json({ message: 'Invalid points amount' });
        }

        const rewardPoints = await RewardPoints.findOne({ user: req.user.id });

        if (!rewardPoints || rewardPoints.balance < pointsToRedeem) {
            return res.status(400).json({ message: 'Insufficient points balance' });
        }

        // 1 point = ₹1 discount
        const discountAmount = pointsToRedeem;

        if (discountAmount > orderTotal) {
            return res.status(400).json({
                message: 'Cannot redeem more points than order total'
            });
        }

        res.json({
            valid: true,
            pointsToRedeem,
            discountAmount,
            newBalance: rewardPoints.balance - pointsToRedeem
        });
    } catch (error) {
        console.error('Error validating redemption:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
