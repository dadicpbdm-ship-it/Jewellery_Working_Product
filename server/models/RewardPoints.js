const mongoose = require('mongoose');

const rewardPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    totalRedeemed: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: {
            type: String,
            enum: ['earned', 'redeemed'],
            required: true
        },
        points: {
            type: Number,
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        description: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Index for faster user lookups
rewardPointsSchema.index({ user: 1 });

const RewardPoints = mongoose.model('RewardPoints', rewardPointsSchema);

module.exports = RewardPoints;
