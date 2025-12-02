const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/authController');
const {
    validateRegistration,
    validateLogin,
    handleValidationErrors
} = require('../middleware/validationMiddleware');

// Install with: npm install express-validator
router.post('/register', validateRegistration, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, authUser);

module.exports = router;
