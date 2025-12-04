const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// Get search suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const regex = new RegExp(query, 'i');

        // Find products matching the query
        const products = await Product.find({
            $or: [
                { name: regex },
                { category: regex },
                { description: regex }
            ]
        })
            .select('name category imageUrl price')
            .limit(5);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all products with advanced filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { keyword, category, material, occasion, style, minPrice, maxPrice, sortBy, page = 1, limit = 12 } = req.query;

        let query = {};

        // Keyword search
        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        // Category filter
        if (category && category !== 'All') {
            query.category = category;
        }

        // Material filter
        if (material && material !== 'All') {
            query.material = material;
        }

        // Occasion filter
        if (occasion && occasion !== 'All') {
            query.occasion = occasion;
        }

        // Style filter
        if (style && style !== 'All') {
            query.style = style;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'price-asc':
                sort.price = 1;
                break;
            case 'price-desc':
                sort.price = -1;
                break;
            case 'newest':
                sort.createdAt = -1;
                break;
            case 'popular':
                sort.rating = -1;
                break;
            default:
                sort.createdAt = -1;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find(query)
            .sort(sort)
            .limit(limitNum)
            .skip(skip);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            limit: limitNum
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create product (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, category, description, image } = req.body;

        const product = await Product.create({
            name,
            price,
            category,
            description,
            image
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, price, category, description, imageUrl, stock } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            const oldPrice = product.price;
            const oldStock = product.stock;

            product.name = name || product.name;
            product.price = price !== undefined ? price : product.price;
            product.category = category || product.category;
            product.description = description || product.description;
            product.imageUrl = imageUrl || product.imageUrl;
            product.stock = stock !== undefined ? stock : product.stock;

            const updatedProduct = await product.save();

            // Check for Price Drop Alerts
            if (product.price < oldPrice) {
                const Alert = require('../models/Alert');
                const whatsappService = require('../services/whatsappService');
                const User = require('../models/User');

                const alerts = await Alert.find({
                    product: product._id,
                    type: 'price',
                    status: 'active',
                    targetPrice: { $gte: product.price }
                });

                for (const alert of alerts) {
                    const user = await User.findById(alert.user);
                    if (user) {
                        await whatsappService.sendPriceDropAlert(user, product, product.price);
                        alert.status = 'triggered';
                        await alert.save();
                    }
                }
            }

            // Check for Back in Stock Alerts
            if (oldStock === 0 && product.stock > 0) {
                const Alert = require('../models/Alert');
                const whatsappService = require('../services/whatsappService');
                const User = require('../models/User');

                const alerts = await Alert.find({
                    product: product._id,
                    type: 'stock',
                    status: 'active'
                });

                for (const alert of alerts) {
                    const user = await User.findById(alert.user);
                    if (user) {
                        await whatsappService.sendBackInStockAlert(user, product);
                        alert.status = 'triggered';
                        await alert.save();
                    }
                }
            }

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: req.params.id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products/:id/reviews
// @desc    Create a product review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user purchased this product
        const Order = require('../models/Order');
        const userOrders = await Order.find({
            user: req.user.id,
            'orderItems.product': req.params.id
        });
        const verifiedPurchase = userOrders.length > 0;

        const review = {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            comment,
            verifiedPurchase
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/:id/reviews
// @desc    Get product reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product.reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/products/:productId/reviews/:reviewId/helpful
// @desc    Mark a review as helpful
// @access  Private
router.put('/:productId/reviews/:reviewId/helpful', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = product.reviews.id(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user already voted
        const alreadyVoted = review.votedBy.some(
            userId => userId.toString() === req.user.id.toString()
        );

        if (alreadyVoted) {
            return res.status(400).json({ message: 'You have already voted on this review' });
        }

        review.votedBy.push(req.user.id);
        review.helpfulVotes = review.votedBy.length;

        await product.save();
        res.json({ message: 'Vote recorded', helpfulVotes: review.helpfulVotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
