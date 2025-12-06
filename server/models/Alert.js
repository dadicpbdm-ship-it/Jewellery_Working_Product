const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['price', 'stock', 'availability'],
        required: true
    },
    targetPrice: {
        type: Number,
        required: function () { return this.type === 'price'; }
    },
    pincode: {
        type: String,
        required: function () { return this.type === 'availability'; }
    },
    channels: [{
        type: String,
        enum: ['email', 'whatsapp', 'push'],
        default: 'email'
    }],
    status: {
        type: String,
        enum: ['active', 'triggered', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);
