const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 6,
        maxlength: 6
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    deliveryDays: {
        type: Number,
        default: 3, // Default delivery time in days
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    codAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for fast lookups
pincodeSchema.index({ code: 1 });
pincodeSchema.index({ city: 1 });

module.exports = mongoose.model('Pincode', pincodeSchema);
