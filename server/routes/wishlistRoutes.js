const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/authMiddleware');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products.product');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist' });
    }
});

// Add to wishlist
router.post('/add', protect, async (req, res) => {
    try {
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, products: [] });
        }

        // Check if product already exists
        const exists = wishlist.products.find(p => p.product.toString() === productId);

        if (exists) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        wishlist.products.push({ product: productId });
        await wishlist.save();

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
});

// Remove from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                p => p.product.toString() !== req.params.productId
            );
            await wishlist.save();
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from wishlist' });
    }
});

// Check if product is in wishlist
router.get('/check/:productId', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.json({ inWishlist: false });
        }

        const exists = wishlist.products.some(
            p => p.product.toString() === req.params.productId
        );

        res.json({ inWishlist: exists });
    } catch (error) {
        res.status(500).json({ message: 'Error checking wishlist status' });
    }
});

module.exports = router;
