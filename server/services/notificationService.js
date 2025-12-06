const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send notification to user through specified channels
 * @param {Object} user - User object with email and phone
 * @param {String} message - Content of the message
 * @param {Array} channels - List of channels to send to ['email', 'whatsapp', 'push']
 * @param {Object} metadata - Additional data (e.g., subject for email)
 */
const sendNotification = async (user, message, channels = ['email'], metadata = {}) => {
    const results = [];

    // 1. Email Channel
    if (channels.includes('email') && user.email) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: metadata.subject || 'Notification from JewelIndia',
                text: message,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #c9a961;">JewelIndia Notification</h2>
                        <p>${message}</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <small>This is an automated message.</small>
                       </div>`
            });
            console.log(`[Notification] Email sent to ${user.email}`);
            results.push({ channel: 'email', success: true });
        } catch (error) {
            console.error(`[Notification] Email failed: ${error.message}`);
            results.push({ channel: 'email', success: false, error: error.message });
        }
    }

    // 2. WhatsApp Channel (Mock/Placeholder)
    if (channels.includes('whatsapp') && user.phone) {
        // Integration Note: Use Twilio / Interakt API here
        console.log(`[Notification] 🔔 MOCK WhatsApp sent to ${user.phone}: "${message}"`);
        results.push({ channel: 'whatsapp', success: true, note: 'Mock implementation' });
    }

    // 3. Push Channel (Mock/Placeholder)
    if (channels.includes('push')) {
        // Integration Note: Use Firebase Cloud Messaging (FCM) here
        console.log(`[Notification] 📲 MOCK Push Notification sent to user ${user._id}: "${message}"`);
        results.push({ channel: 'push', success: true, note: 'Mock implementation' });
    }

    return results;
};

module.exports = { sendNotification };
