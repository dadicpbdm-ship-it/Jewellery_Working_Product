const otpService = require('../services/otpService');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const result = await otpService.sendOTP(phone);

        res.status(200).json({
            success: true,
            message: result.message,
            expiresIn: result.expiresIn,
            otp: result.otp // Return OTP to client for testing
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to send OTP'
        });
    }
};

/**
 * @desc    Verify OTP and login/register user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP are required' });
        }

        // Verify OTP
        const user = await otpService.verifyOTP(phone, otp);

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or phone number' });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Return user data
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                phoneVerified: user.phoneVerified,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to verify OTP'
        });
    }
};

/**
 * @desc    Resend OTP to phone number
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const result = await otpService.sendOTP(phone);

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully',
            expiresIn: result.expiresIn,
            otp: result.otp // Return OTP to client for testing
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to resend OTP'
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    resendOTP
};
