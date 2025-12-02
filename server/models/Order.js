const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    guestInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    codPaymentReceived: {
        type: Boolean,
        default: false
    },
    codPaymentReceivedAt: {
        type: Date
    },
    deliveryAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Database Indexes for Performance
orderSchema.index({ user: 1, createdAt: -1 }); // For user's order history (sorted by date)
orderSchema.index({ deliveryAgent: 1, isDelivered: 1 }); // For delivery agent queries
orderSchema.index({ isDelivered: 1, deliveredAt: -1 }); // For delivered orders
orderSchema.index({ isPaid: 1 }); // For payment status queries
orderSchema.index({ createdAt: -1 }); // For recent orders

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
