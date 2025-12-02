const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    subject: {
        type: String
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        minlength: [10, 'Message must be at least 10 characters long']
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved'],
        default: 'new'
    }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
