const User = require('../models/User');

// OTP Configuration
const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 3;
const OTP_RATE_LIMIT_HOURS = 1;

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SMS (Mock mode - logs to console)
 * In production, replace with actual SMS service (Twilio, MSG91, etc.)
 */
const sendOTPviaSMS = async (phone, otp) => {
    // MOCK MODE: Log OTP to console
    console.log('='.repeat(50));
    console.log('📱 MOCK SMS SERVICE');
    console.log('='.repeat(50));
    console.log(`To: ${phone}`);
    console.log(`OTP: ${otp}`);
    console.log(`Valid for: ${OTP_EXPIRY_MINUTES} minutes`);
    console.log('='.repeat(50));

    // TODO: In production, replace with actual SMS service
    // Example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: `Your OTP is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
    //     from: process.env.TWILIO_PHONE,
    //     to: phone
    // });

    return true;
};

/**
 * Check if phone number has exceeded OTP request rate limit
 */
const checkRateLimit = async (phone) => {
    return true; // Disable rate limiting for testing/mock mode

    /* Original Rate Limit Logic
    const user = await User.findOne({ phone });

    if (!user || !user.otpExpiry) {
        return true; // No previous OTP or user doesn't exist
    }

    const now = new Date();
    const hourAgo = new Date(now.getTime() - OTP_RATE_LIMIT_HOURS * 60 * 60 * 1000);

    // If last OTP was sent within the rate limit window, check if it's still valid
    if (user.otpExpiry > hourAgo) {
        // Allow resend only if current OTP has expired
        if (user.otpExpiry < now) {
            return true;
        }
        return false; // OTP still valid, don't send new one
    }

    return true;
    */
};

/**
 * Generate and send OTP to phone number
 */
const sendOTP = async (phone) => {
    try {
        // Validate phone format (basic validation)
        const phoneRegex = /^[+]?[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            throw new Error('Invalid phone number format');
        }

        // Check rate limiting
        const canSend = await checkRateLimit(phone);
        if (!canSend) {
            throw new Error('Please wait before requesting a new OTP');
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Find or create user
        let user = await User.findOne({ phone });

        if (user) {
            // Update existing user's OTP
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        } else {
            // Create temporary user entry for OTP verification
            // Full user will be created upon successful OTP verification
            user = await User.create({
                name: 'User', // Temporary name, will be updated later
                phone,
                otp,
                otpExpiry,
                phoneVerified: false,
                // Initialize loyalty object explicitly to ensure defaults are applied
                loyalty: {
                    points: 0,
                    tier: 'Silver',
                    totalSpent: 0,
                    pointsHistory: []
                }
            });
        }

        // Send OTP via SMS
        await sendOTPviaSMS(phone, otp);

        return {
            success: true,
            message: 'OTP sent successfully',
            expiresIn: OTP_EXPIRY_MINUTES,
            otp // Include OTP in response for testing/mock mode
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP and return user
 */
const verifyOTP = async (phone, otp) => {
    try {
        const user = await User.findOne({ phone });

        if (!user) {
            throw new Error('Phone number not found');
        }

        // Check if OTP exists
        if (!user.otp) {
            throw new Error('No OTP found. Please request a new OTP');
        }

        // Check if OTP has expired
        if (user.otpExpiry < new Date()) {
            throw new Error('OTP has expired. Please request a new OTP');
        }

        // Verify OTP
        if (user.otp !== otp) {
            throw new Error('Invalid OTP');
        }

        // OTP is valid - mark phone as verified and clear OTP
        user.phoneVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return user;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Clear expired OTPs (can be run as a cron job)
 */
const clearExpiredOTPs = async () => {
    try {
        const result = await User.updateMany(
            { otpExpiry: { $lt: new Date() } },
            { $unset: { otp: '', otpExpiry: '' } }
        );
        console.log(`Cleared ${result.modifiedCount} expired OTPs`);
        return result;
    } catch (error) {
        console.error('Error clearing expired OTPs:', error);
        throw error;
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP,
    clearExpiredOTPs,
    OTP_EXPIRY_MINUTES
};
