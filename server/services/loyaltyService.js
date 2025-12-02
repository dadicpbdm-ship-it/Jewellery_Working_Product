const User = require('../models/User');

/**
 * Loyalty & Rewards Service
 * Handles points calculation, tier management, and referrals
 */

// Tier thresholds
const TIER_THRESHOLDS = {
    Silver: 0,
    Gold: 10000,
    Platinum: 50000
};

// Tier benefits
const TIER_BENEFITS = {
    Silver: {
        discount: 0.05, // 5%
        freeShipping: false,
        earlyAccess: false
    },
    Gold: {
        discount: 0.10, // 10%
        freeShipping: true,
        earlyAccess: true
    },
    Platinum: {
        discount: 0.15, // 15%
        freeShipping: true,
        earlyAccess: true,
        prioritySupport: true
    }
};

// Points conversion rate
const POINTS_PER_RUPEE = 1; // 1 point per ₹1 spent
const RUPEES_PER_100_POINTS = 10; // 100 points = ₹10 discount

/**
 * Award points to user for a purchase
 */
const awardPoints = async (userId, orderAmount, orderId) => {
    try {
        const points = Math.floor(orderAmount * POINTS_PER_RUPEE);

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $inc: {
                    'loyalty.points': points,
                    'loyalty.totalSpent': orderAmount
                },
                $push: {
                    'loyalty.pointsHistory': {
                        points,
                        type: 'earned',
                        description: `Earned from purchase of ₹${orderAmount}`,
                        orderId,
                        date: new Date()
                    }
                }
            },
            { new: true }
        );

        // Check for tier upgrade
        await checkTierUpgrade(userId);

        console.log(`[Loyalty] Awarded ${points} points to user ${userId}`);
        return { points, newBalance: user.loyalty.points };
    } catch (error) {
        console.error('[Loyalty] Error awarding points:', error);
        throw error;
    }
};

/**
 * Redeem points for discount
 */
const redeemPoints = async (userId, pointsToRedeem) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.loyalty.points < pointsToRedeem) {
            throw new Error('Insufficient points');
        }

        if (pointsToRedeem < 100) {
            throw new Error('Minimum 100 points required for redemption');
        }

        // Calculate discount amount
        const discountAmount = (pointsToRedeem / 100) * RUPEES_PER_100_POINTS;

        // Deduct points
        user.loyalty.points -= pointsToRedeem;
        user.loyalty.pointsHistory.push({
            points: -pointsToRedeem,
            type: 'redeemed',
            description: `Redeemed ${pointsToRedeem} points for ₹${discountAmount} discount`,
            date: new Date()
        });

        await user.save();

        console.log(`[Loyalty] User ${userId} redeemed ${pointsToRedeem} points for ₹${discountAmount}`);
        return { discountAmount, remainingPoints: user.loyalty.points };
    } catch (error) {
        console.error('[Loyalty] Error redeeming points:', error);
        throw error;
    }
};

/**
 * Check and upgrade user tier based on total spent
 */
const checkTierUpgrade = async (userId) => {
    try {
        const user = await User.findById(userId);
        const totalSpent = user.loyalty.totalSpent;

        let newTier = 'Silver';
        if (totalSpent >= TIER_THRESHOLDS.Platinum) {
            newTier = 'Platinum';
        } else if (totalSpent >= TIER_THRESHOLDS.Gold) {
            newTier = 'Gold';
        }

        if (newTier !== user.loyalty.tier) {
            const oldTier = user.loyalty.tier;
            user.loyalty.tier = newTier;

            // Award bonus points for tier upgrade
            const bonusPoints = newTier === 'Platinum' ? 1000 : 500;
            user.loyalty.points += bonusPoints;
            user.loyalty.pointsHistory.push({
                points: bonusPoints,
                type: 'bonus',
                description: `Tier upgrade bonus: ${oldTier} → ${newTier}`,
                date: new Date()
            });

            await user.save();

            console.log(`[Loyalty] User ${userId} upgraded from ${oldTier} to ${newTier}`);
            // TODO: Send congratulations email
            return { upgraded: true, oldTier, newTier, bonusPoints };
        }

        return { upgraded: false };
    } catch (error) {
        console.error('[Loyalty] Error checking tier upgrade:', error);
        throw error;
    }
};

/**
 * Process referral - award points to both referrer and referee
 */
const processReferral = async (referralCode, newUserId) => {
    try {
        // Find referrer by referral code
        const referrer = await User.findOne({ 'loyalty.referralCode': referralCode });

        if (!referrer) {
            throw new Error('Invalid referral code');
        }

        const referralBonus = 500; // ₹500 worth of points

        // Award points to referrer
        referrer.loyalty.points += referralBonus;
        referrer.loyalty.pointsHistory.push({
            points: referralBonus,
            type: 'referral',
            description: `Referral bonus for inviting new user`,
            date: new Date()
        });
        await referrer.save();

        // Award points to new user
        const newUser = await User.findById(newUserId);
        newUser.loyalty.points += referralBonus;
        newUser.loyalty.referredBy = referrer._id;
        newUser.loyalty.pointsHistory.push({
            points: referralBonus,
            type: 'referral',
            description: `Welcome bonus for using referral code ${referralCode}`,
            date: new Date()
        });
        await newUser.save();

        console.log(`[Loyalty] Referral processed: ${referrer._id} referred ${newUserId}`);
        return { success: true, bonusPoints: referralBonus };
    } catch (error) {
        console.error('[Loyalty] Error processing referral:', error);
        throw error;
    }
};

/**
 * Get tier benefits for a user
 */
const getTierBenefits = (tier) => {
    return TIER_BENEFITS[tier] || TIER_BENEFITS.Silver;
};

/**
 * Calculate discount based on tier
 */
const calculateTierDiscount = (tier, amount) => {
    const benefits = getTierBenefits(tier);
    return amount * benefits.discount;
};

/**
 * Award birthday bonus points
 */
const awardBirthdayBonus = async (userId) => {
    try {
        const bonusPoints = 200;

        await User.findByIdAndUpdate(userId, {
            $inc: { 'loyalty.points': bonusPoints },
            $push: {
                'loyalty.pointsHistory': {
                    points: bonusPoints,
                    type: 'bonus',
                    description: 'Birthday bonus',
                    date: new Date()
                }
            }
        });

        console.log(`[Loyalty] Birthday bonus awarded to user ${userId}`);
        return { bonusPoints };
    } catch (error) {
        console.error('[Loyalty] Error awarding birthday bonus:', error);
        throw error;
    }
};

module.exports = {
    awardPoints,
    redeemPoints,
    checkTierUpgrade,
    processReferral,
    getTierBenefits,
    calculateTierDiscount,
    awardBirthdayBonus,
    TIER_THRESHOLDS,
    TIER_BENEFITS
};
