const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
router.post('/add', protect, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Remove item from wishlist
// @route   POST /api/wishlist/remove
// @access  Private
router.post('/remove', protect, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Clear all items from wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = [];
        await user.save();
        res.json({ message: 'Wishlist cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
