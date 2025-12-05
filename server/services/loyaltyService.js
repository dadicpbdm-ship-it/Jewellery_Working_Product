const User = require('../models/User');
const RewardPoints = require('../models/RewardPoints');
const Order = require('../models/Order');

/**
 * Loyalty & Rewards Service
 * Handles points calculation, tier management, and referrals
 */

// Points conversion rate (simplified: 1% of order value)
const POINTS_PERCENTAGE = 0.01; // 1% of order value
const POINTS_TO_RUPEES = 1; // 1 point = ₹1

/**
 * Award points to user for a purchase
 */
const awardPoints = async (userId, orderAmount, orderId) => {
    try {
        // Calculate points: 1% of order value
        const points = Math.floor(orderAmount * POINTS_PERCENTAGE);

        // Find or create reward points record
        let rewardPoints = await RewardPoints.findOne({ user: userId });

        if (!rewardPoints) {
            rewardPoints = await RewardPoints.create({
                user: userId,
                balance: 0,
                totalEarned: 0,
                totalRedeemed: 0,
                transactions: []
            });
        }

        // Update balance and totals
        rewardPoints.balance += points;
        rewardPoints.totalEarned += points;
        rewardPoints.transactions.push({
            type: 'earned',
            points,
            order: orderId,
            description: `Earned from purchase of ₹${orderAmount.toLocaleString('en-IN')}`,
            date: new Date()
        });

        await rewardPoints.save();

        // Update order with earned points
        await Order.findByIdAndUpdate(orderId, {
            'rewardPoints.earned': points
        });

        console.log(`[Loyalty] Awarded ${points} points to user ${userId}`);
        return { points, newBalance: rewardPoints.balance };
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

/**
 * Calculate discount amount for given points (without deducting)
 * Used during checkout to show potential discount
 */
const calculatePointsDiscount = (points) => {
    if (points < 100) {
        throw new Error('Minimum 100 points required for redemption');
    }

    // 100 points = ₹10 discount
    const discount = (points / 100) * RUPEES_PER_100_POINTS;
    return Math.floor(discount); // Round down to avoid fractional currency
};

/**
 * Deduct points for order payment
 * This is called after successful payment/order placement
 */
const deductPointsForOrder = async (userId, pointsToUse, orderId) => {
    try {
        const rewardPoints = await RewardPoints.findOne({ user: userId });

        if (!rewardPoints) {
            throw new Error('Reward points record not found');
        }

        if (rewardPoints.balance < pointsToUse) {
            throw new Error('Insufficient points');
        }

        // 1 point = ₹1 discount
        const discountAmount = pointsToUse * POINTS_TO_RUPEES;

        // Deduct points
        rewardPoints.balance -= pointsToUse;
        rewardPoints.totalRedeemed += pointsToUse;
        rewardPoints.transactions.push({
            type: 'redeemed',
            points: pointsToUse,
            order: orderId,
            description: `Redeemed ${pointsToUse} points for ₹${discountAmount.toLocaleString('en-IN')} discount`,
            date: new Date()
        });

        await rewardPoints.save();

        console.log(`[Loyalty] User ${userId} used ${pointsToUse} points (₹${discountAmount}) for order ${orderId}`);
        return {
            success: true,
            pointsDeducted: pointsToUse,
            discountAmount,
            remainingPoints: rewardPoints.balance
        };
    } catch (error) {
        console.error('[Loyalty] Error deducting points for order:', error);
        throw error;
    }
};

module.exports = {
    awardPoints,
    deductPointsForOrder,
    POINTS_PERCENTAGE,
    POINTS_TO_RUPEES
};
