const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Process a refund for a payment
 * @param {string} paymentId - The Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, defaults to full amount)
 * @returns {Promise<Object>} - The refund details
 */
const processRefund = async (paymentId, amount = null) => {
    try {
        const options = {};
        if (amount) {
            options.amount = amount * 100; // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, options);
        console.log(`[Payment] Refund processed for ${paymentId}:`, refund);
        return refund;
    } catch (error) {
        console.error('[Payment] Error processing refund:', error);
        throw new Error(error.error?.description || 'Refund failed');
    }
};

module.exports = {
    processRefund
};
