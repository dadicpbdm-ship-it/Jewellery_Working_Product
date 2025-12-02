const mongoose = require('mongoose');

const customDesignSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'My Custom Design'
    },
    type: {
        type: String,
        enum: ['Ring', 'Necklace', 'Earrings', 'Bracelet'],
        required: true
    },
    metal: {
        type: String,
        enum: ['Gold', 'Rose Gold', 'White Gold', 'Platinum', 'Silver'],
        required: true
    },
    gemstone: {
        type: String,
        enum: ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'None'],
        default: 'None'
    },
    gemstoneSize: {
        type: Number, // in carats
        default: 0
    },
    engravingText: {
        type: String,
        maxLength: 20
    },
    size: {
        type: Number, // Ring size or chain length
        required: true
    },
    estimatedPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'saved', 'ordered'],
        default: 'draft'
    },
    previewImage: {
        type: String // URL of the generated preview snapshot
    }
}, { timestamps: true });

module.exports = mongoose.model('CustomDesign', customDesignSchema);
