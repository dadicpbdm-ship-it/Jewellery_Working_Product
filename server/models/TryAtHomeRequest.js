const mongoose = require('mongoose');

const tryAtHomeRequestSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        }
    ],
    address: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTimeSlot: {
        type: String,
        required: true,
        enum: ['10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM']
    },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Assigned', 'Completed', 'Cancelled', 'Rejected'],
        default: 'Requested'
    },
    assignedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminComment: {
        type: String
    },
    agentComment: {
        type: String
    }
}, {
    timestamps: true
});

const TryAtHomeRequest = mongoose.model('TryAtHomeRequest', tryAtHomeRequestSchema);

module.exports = TryAtHomeRequest;
