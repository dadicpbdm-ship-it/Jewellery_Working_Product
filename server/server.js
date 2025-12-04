const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const contactRoutes = require('./routes/contactRoutes');
const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const customDesignRoutes = require('./routes/customDesignRoutes');
const pincodeRoutes = require('./routes/pincodeRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const tryAtHomeRoutes = require('./routes/tryAtHomeRoutes');
const alertRoutes = require('./routes/alertRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const customizationRoutes = require('./routes/customizationRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS - Simplified for development
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Replace with your production domain
        : true, // Allow all origins in development
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate Limiting - Install with: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased from 5 to 100 for better UX during development
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false, // Count failed requests
});

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Increased for better UX
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jewellery_app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/delivery-agents', deliveryAgentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/custom-designs', customDesignRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/try-at-home', tryAtHomeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/customizations', customizationRoutes);

app.get('/', (req, res) => {
    res.send('Jewellery App API is running');
});

// 404 Handler - Must be after all routes
app.use(notFound);

// Error Handler - Must be last middleware
app.use(errorHandler);

// Start Server with Timeout Configuration
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Set request timeout to 30 seconds
server.timeout = 30000;

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});
