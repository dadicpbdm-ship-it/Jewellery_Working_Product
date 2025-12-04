const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { optionalProtect } = require('../middleware/optionalAuthMiddleware');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get Razorpay Key
router.get('/get-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Razorpay Order (supports both logged-in and guest users)
router.post('/create-order', optionalProtect, async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY_ID')) {
            return res.status(400).json({
                message: 'Razorpay API Keys are not configured. Please add your keys to server/.env file.',
                code: 'KEYS_NOT_CONFIGURED'
            });
        }

        const { amount, pointsDiscount = 0 } = req.body;

        // Calculate actual payment amount after points discount
        const paymentAmount = Math.max(0, amount - pointsDiscount);

        // If fully paid by points, no need to create Razorpay order
        if (paymentAmount === 0) {
            console.log('[Payment] Order fully paid by reward points');
            return res.json({
                fullyPaidByPoints: true,
                amount: 0,
                pointsDiscount
            });
        }

        const options = {
            amount: paymentAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        console.log(`[Payment] Razorpay order created: ₹${paymentAmount} (Original: ₹${amount}, Points Discount: ₹${pointsDiscount})`);

        res.json({
            ...order,
            pointsDiscount,
            originalAmount: amount,
            paymentAmount
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Error creating Razorpay order' });
    }
});

// Verify Payment (supports both logged-in and guest users)
router.post('/verify', optionalProtect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is successful, update the order in DB
            if (order_id) {
                const order = await Order.findById(order_id);
                if (order) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.paymentResult = {
                        id: razorpay_payment_id,
                        status: 'success',
                        update_time: Date.now(),
                        email_address: req.user ? req.user.email : (order.guestInfo ? order.guestInfo.email : 'guest')
                    };
                    await order.save();
                }
            }

            res.json({ message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

module.exports = router;
