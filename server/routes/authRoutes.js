const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/authController');
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');
const {
    validateRegistration,
    validateLogin,
    handleValidationErrors
} = require('../middleware/validationMiddleware');

// Traditional auth routes
router.post('/register', validateRegistration, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, authUser);

// OTP auth routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

module.exports = router;
