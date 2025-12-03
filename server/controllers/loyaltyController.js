const User = require('../models/User');
const loyaltyService = require('../services/loyaltyService');

/**
 * @route   GET /api/loyalty/dashboard
 * @desc    Get user's loyalty dashboard data
 * @access  Private
 */
const getLoyaltyDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('loyalty name email');

        if (!user) {
            console.log('❌ Loyalty Dashboard: User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`🔍 Loyalty Dashboard for user: ${user._id}`);
        console.log('Loyalty Object:', user.loyalty);

        // Initialize loyalty object if it doesn't exist (Self-healing for old/OTP users)
        if (!user.loyalty) {
            user.loyalty = {
                points: 0,
                tier: 'Silver',
                totalSpent: 0,
                pointsHistory: []
            };
            // Generate referral code immediately
            user.generateReferralCode();
            await user.save();
        }

        // Generate referral code if not exists (for users with loyalty object but no code)
        if (!user.loyalty.referralCode) {
            user.generateReferralCode();
            await user.save();
        }

        const tierBenefits = loyaltyService.getTierBenefits(user.loyalty.tier);
        const nextTier = getNextTier(user.loyalty.tier);
        const pointsToNextTier = nextTier ? loyaltyService.TIER_THRESHOLDS[nextTier] - user.loyalty.totalSpent : 0;

        res.json({
            points: user.loyalty.points,
            tier: user.loyalty.tier,
            totalSpent: user.loyalty.totalSpent,
            referralCode: user.loyalty.referralCode,
            tierBenefits,
            nextTier,
            pointsToNextTier,
            pointsHistory: user.loyalty.pointsHistory.slice(-10).reverse() // Last 10 transactions
        });
    } catch (error) {
        console.error('Error fetching loyalty dashboard:', error);
        res.status(500).json({ message: 'Error fetching loyalty data' });
    }
};

/**
 * @route   GET /api/loyalty/history
 * @desc    Get user's complete points history
 * @access  Private
 */
const getPointsHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('loyalty.pointsHistory')
            .populate('loyalty.pointsHistory.orderId', 'createdAt totalPrice');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            history: user.loyalty.pointsHistory.reverse()
        });
    } catch (error) {
        console.error('Error fetching points history:', error);
        res.status(500).json({ message: 'Error fetching points history' });
    }
};

/**
 * @route   POST /api/loyalty/redeem
 * @desc    Redeem points for discount
 * @access  Private
 */
const redeemPoints = async (req, res) => {
    try {
        const { points } = req.body;

        if (!points || points < 100) {
            return res.status(400).json({ message: 'Minimum 100 points required for redemption' });
        }

        const result = await loyaltyService.redeemPoints(req.user._id, points);

        res.json({
            message: 'Points redeemed successfully',
            discountAmount: result.discountAmount,
            remainingPoints: result.remainingPoints
        });
    } catch (error) {
        console.error('Error redeeming points:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route   POST /api/loyalty/apply-referral
 * @desc    Apply referral code for new user
 * @access  Private
 */
const applyReferralCode = async (req, res) => {
    try {
        const { referralCode } = req.body;

        if (!referralCode) {
            return res.status(400).json({ message: 'Referral code required' });
        }

        // Check if user already has a referrer
        const user = await User.findById(req.user._id);
        if (user.loyalty.referredBy) {
            return res.status(400).json({ message: 'Referral code already applied' });
        }

        const result = await loyaltyService.processReferral(referralCode, req.user._id);

        res.json({
            message: 'Referral code applied successfully!',
            bonusPoints: result.bonusPoints
        });
    } catch (error) {
        console.error('Error applying referral code:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route   GET /api/loyalty/tier-info
 * @desc    Get information about all tiers
 * @access  Public
 */
const getTierInfo = (req, res) => {
    res.json({
        tiers: {
            Silver: {
                threshold: loyaltyService.TIER_THRESHOLDS.Silver,
                benefits: loyaltyService.TIER_BENEFITS.Silver
            },
            Gold: {
                threshold: loyaltyService.TIER_THRESHOLDS.Gold,
                benefits: loyaltyService.TIER_BENEFITS.Gold
            },
            Platinum: {
                threshold: loyaltyService.TIER_THRESHOLDS.Platinum,
                benefits: loyaltyService.TIER_BENEFITS.Platinum
            }
        },
        pointsConversion: {
            earnRate: '1 point per ₹1 spent',
            redeemRate: '100 points = ₹10 discount'
        }
    });
};

// Helper function to get next tier
const getNextTier = (currentTier) => {
    const tiers = ['Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

module.exports = {
    getLoyaltyDashboard,
    getPointsHistory,
    redeemPoints,
    applyReferralCode,
    getTierInfo
};
