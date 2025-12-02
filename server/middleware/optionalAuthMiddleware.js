const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error('Token verification failed:', error.message);
            // If token is invalid, just proceed as guest (req.user will be undefined)
        }
    }

    // Always proceed to next middleware, whether authenticated or not
    next();
};

module.exports = { optionalProtect };
