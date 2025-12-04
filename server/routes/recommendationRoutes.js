const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/recommendations/for-you
// @desc    Get personalized recommendations based on user's browsing/purchase history
// @access  Private
router.get('/for-you', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's order history
        const orders = await Order.find({ user: userId }).populate('orderItems.product');

        // Extract categories and materials from purchased products
        const purchasedCategories = new Set();
        const purchasedMaterials = new Set();

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product) {
                    purchasedCategories.add(item.product.category);
                    purchasedMaterials.add(item.product.material);
                }
            });
        });

        // Get recently viewed products from request (passed as query param)
        const recentlyViewedIds = req.query.recentlyViewed ? req.query.recentlyViewed.split(',') : [];

        // Build recommendation query
        const query = {
            $or: [
                { category: { $in: Array.from(purchasedCategories) } },
                { material: { $in: Array.from(purchasedMaterials) } },
                { _id: { $in: recentlyViewedIds } }
            ]
        };

        const recommendations = await Product.find(query)
            .sort({ rating: -1, numReviews: -1 })
            .limit(10);

        res.json(recommendations);
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ message: 'Server error fetching recommendations' });
    }
});

// @route   GET /api/recommendations/similar/:productId
// @desc    Get similar products based on category, material, and price range
// @access  Public
router.get('/similar/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Define price range (±20%)
        const priceMin = product.price * 0.8;
        const priceMax = product.price * 1.2;

        // Find similar products
        const similarProducts = await Product.find({
            _id: { $ne: product._id }, // Exclude current product
            $or: [
                { category: product.category },
                { material: product.material },
                { style: product.style }
            ],
            price: { $gte: priceMin, $lte: priceMax }
        })
            .sort({ rating: -1 })
            .limit(6);

        res.json(similarProducts);
    } catch (error) {
        console.error('Similar products error:', error);
        res.status(500).json({ message: 'Server error fetching similar products' });
    }
});

// @route   GET /api/recommendations/complete-the-look/:productId
// @desc    Get complementary products (different category, same occasion/style)
// @access  Public
router.get('/complete-the-look/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find complementary products (different category, same occasion/style)
        const complementaryProducts = await Product.find({
            _id: { $ne: product._id },
            category: { $ne: product.category }, // Different category
            $or: [
                { occasion: product.occasion },
                { style: product.style }
            ]
        })
            .sort({ rating: -1 })
            .limit(4);

        res.json(complementaryProducts);
    } catch (error) {
        console.error('Complete the look error:', error);
        res.status(500).json({ message: 'Server error fetching complementary products' });
    }
});

// @route   GET /api/recommendations/trending
// @desc    Get trending/popular products
// @access  Public
router.get('/trending', async (req, res) => {
    try {
        const trendingProducts = await Product.find()
            .sort({ numReviews: -1, rating: -1 })
            .limit(8);

        res.json(trendingProducts);
    } catch (error) {
        console.error('Trending products error:', error);
        res.status(500).json({ message: 'Server error fetching trending products' });
    }
});

module.exports = router;
