const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'delivery'], default: 'user' },
    addresses: [{
        name: String,
        address: String,
        city: String,
        postalCode: String,
        country: String
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    assignedArea: {
        type: String,
        default: ''
    },
    activeOrders: {
        type: Number,
        default: 0
    },
    // Loyalty & Rewards Program
    loyalty: {
        points: {
            type: Number,
            default: 0
        },
        tier: {
            type: String,
            enum: ['Silver', 'Gold', 'Platinum'],
            default: 'Silver'
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        pointsHistory: [{
            points: Number,
            type: {
                type: String,
                enum: ['earned', 'redeemed', 'expired', 'bonus', 'referral']
            },
            description: String,
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            },
            date: {
                type: Date,
                default: Date.now
            }
        }]
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    // Increased from default 10 to 12 rounds for better security
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.generateReferralCode = function () {
    if (!this.loyalty.referralCode) {
        const code = `${this.name.substring(0, 3).toUpperCase()}${this._id.toString().slice(-6)}`;
        this.loyalty.referralCode = code;
    }
    return this.loyalty.referralCode;
};

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
