const dotenv = require('dotenv');
dotenv.config();

// Initialize Twilio client (will only work if keys are present)
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        const twilio = require('twilio');
        client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (error) {
        console.warn('Twilio module not found or failed to initialize. Using mock mode.');
    }
}

/**
 * Send a WhatsApp message to a user
 * @param {string} to - User's phone number
 * @param {string} message - Message content
 */
const sendWhatsAppMessage = async (to, message) => {
    try {
        // MOCK MODE: Log to console if no Twilio client or explicitly in mock mode
        if (!client || process.env.MOCK_WHATSAPP === 'true') {
            console.log('\n' + '='.repeat(50));
            console.log('📱 MOCK WHATSAPP MESSAGE');
            console.log('='.repeat(50));
            console.log(`To: ${to}`);
            console.log(`Message: ${message}`);
            console.log('='.repeat(50) + '\n');
            return { success: true, mock: true };
        }

        // PRODUCTION MODE: Send via Twilio
        // Note: Twilio WhatsApp requires 'whatsapp:' prefix for numbers
        const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
        const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        const response = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber
        });

        console.log(`[WhatsApp] Message sent to ${to}: ${response.sid}`);
        return { success: true, sid: response.sid };

    } catch (error) {
        console.error('[WhatsApp] Error sending message:', error.message);
        // Don't throw error to prevent blocking main flow
        return { success: false, error: error.message };
    }
};

/**
 * Send Order Confirmation Message
 */
const sendOrderConfirmation = async (order, user) => {
    const phone = user.phone || order.guestInfo?.phone;
    if (!phone) return;

    const message = `🎉 *Order Confirmed!*
    
Hi ${user.name || order.guestInfo.name},
Thank you for shopping with JewelIndia! 💎

Order ID: *${order._id.toString().slice(-6).toUpperCase()}*
Total: ₹${order.totalPrice.toLocaleString('en-IN')}

We will notify you once your order is shipped.
Track your order here: ${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order._id}`;

    return await sendWhatsAppMessage(phone, message);
};

/**
 * Send Order Shipped Message
 */
const sendOrderShipped = async (order, user) => {
    const phone = user.phone || order.guestInfo?.phone;
    if (!phone) return;

    const message = `🚚 *Order Shipped!*

Hi ${user.name || order.guestInfo.name},
Great news! Your order *${order._id.toString().slice(-6).toUpperCase()}* has been shipped.

It is on its way to you.
Track delivery: ${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order._id}`;

    return await sendWhatsAppMessage(phone, message);
};

/**
 * Send Order Delivered Message
 */
const sendOrderDelivered = async (order, user) => {
    const phone = user.phone || order.guestInfo?.phone;
    if (!phone) return;

    const message = `✅ *Order Delivered!*

Hi ${user.name || order.guestInfo.name},
Your order *${order._id.toString().slice(-6).toUpperCase()}* has been delivered successfully.

We hope you love your purchase! ✨
If you have any feedback, please let us know.`;

    return await sendWhatsAppMessage(phone, message);
};

/**
 * Send Return/Exchange Status Update
 */
const sendReturnRequestUpdate = async (order, user) => {
    const phone = user.phone || order.guestInfo?.phone;
    if (!phone) return;

    const req = order.returnExchangeRequest;
    const statusEmoji = req.status === 'Approved' ? '✅' : req.status === 'Rejected' ? '❌' : 'ℹ️';

    const message = `${statusEmoji} *${req.type} Update*

Hi ${user.name || order.guestInfo.name},
Your ${req.type} request for order *${order._id.toString().slice(-6).toUpperCase()}* has been *${req.status}*.

${req.adminComment ? `Note: ${req.adminComment}` : ''}

Check details: ${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order._id}`;

    return await sendWhatsAppMessage(phone, message);
};

/**
 * Send Price Drop Alert
 */
const sendPriceDropAlert = async (user, product, newPrice) => {
    const message = `🔔 *Price Drop Alert!*
    
Hi ${user.name},
Good news! The price for *${product.name}* has dropped to ₹${newPrice.toLocaleString('en-IN')}.

Grab it now: ${process.env.CLIENT_URL || 'http://localhost:5173'}/product/${product._id}`;

    return await sendWhatsAppMessage(user.phone, message);
};

/**
 * Send Back in Stock Alert
 */
const sendBackInStockAlert = async (user, product) => {
    const message = `📦 *Back in Stock!*
    
Hi ${user.name},
The item you were waiting for, *${product.name}*, is back in stock!

Buy now: ${process.env.CLIENT_URL || 'http://localhost:5173'}/product/${product._id}`;

    return await sendWhatsAppMessage(user.phone, message);
};

module.exports = {
    sendOrderConfirmation,
    sendOrderShipped,
    sendOrderDelivered,
    sendReturnRequestUpdate,
    sendPriceDropAlert,
    sendBackInStockAlert
};
