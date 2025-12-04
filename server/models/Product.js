const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    // Multiple images for gallery
    images: {
        type: [String],
        default: function () {
            return [this.imageUrl];
        }
    },
    // Advanced filtering fields
    material: {
        type: String,
        enum: ['Gold', 'Silver', 'Diamond', 'Platinum', 'Rose Gold', 'White Gold', 'Other'],
        default: 'Gold'
    },
    occasion: {
        type: String,
        enum: ['Wedding', 'Party', 'Daily', 'Festival', 'Anniversary', 'Engagement', 'Other'],
        default: 'Daily'
    },
    style: {
        type: String,
        enum: ['Western', 'Traditional', 'Contemporary', 'Fusion', 'Minimalist', 'Other'],
        default: 'Traditional'
    },
    stock: {
        type: Number,
        default: 10
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        verifiedPurchase: {
            type: Boolean,
            default: false
        },
        helpfulVotes: {
            type: Number,
            default: 0
        },
        votedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    // Tags for better searchability
    tags: {
        type: [String],
        default: []
    },
    // Related products for recommendations
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // Customization options
    customizationOptions: {
        allowEngraving: {
            type: Boolean,
            default: false
        },
        maxEngravingChars: {
            type: Number,
            default: 20
        },
        engravingPrice: {
            type: Number,
            default: 500
        },
        availableSizes: {
            type: [String],
            default: []
        },
        materialVariants: [{
            material: String,
            priceAdjustment: Number, // Can be positive or negative
            available: {
                type: Boolean,
                default: true
            }
        }]
    },
    // Blockchain Certification
    certification: {
        certificateNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        certificateType: {
            type: String,
            enum: ['BIS', 'IGI', 'GIA', 'SGL', 'Internal'],
            default: 'Internal'
        },
        hallmarkId: String,
        purity: String, // e.g., "22K", "18K"
        weight: Number,
        diamondDetails: {
            carat: Number,
            color: String,
            clarity: String,
            cut: String
        },
        qrCode: String, // Base64 QR code image
        blockchainHash: String, // SHA-256 hash
        certificatePdfUrl: String,
        issuedDate: Date,
        expiryDate: Date,
        verificationUrl: String
    }
}, { timestamps: true });

// Database Indexes for Performance
productSchema.index({ category: 1 }); // For category filtering
productSchema.index({ price: 1 }); // For price sorting/filtering
productSchema.index({ category: 1, price: 1 }); // Compound index for category + price queries
productSchema.index({ name: 'text', description: 'text' }); // Text search index
productSchema.index({ stock: 1 }); // For low stock queries
productSchema.index({ style: 1 }); // For style filtering

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
