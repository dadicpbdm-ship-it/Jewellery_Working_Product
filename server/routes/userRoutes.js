const express = require('express');
const router = express.Router();
const { getUserProfile, addUserAddress, updateUserPassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');

router.get('/profile', protect, getUserProfile);
router.put('/profile/address', protect, addUserAddress);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/profile/password
// @desc    Update user password
// @access  Private
router.put('/profile/password', protect, updateUserPassword);

// @route   GET /api/users/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.addresses) {
            user.addresses = [];
        }
        user.addresses.push(req.body);
        await user.save();
        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/addresses/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/addresses/:id
// @desc    Update address
// @access  Private
router.put('/addresses/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);

        if (addressIndex > -1) {
            user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...req.body };
            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const deliveredOrders = orders.filter(o => o.isDelivered).length;
        const pendingOrders = totalOrders - deliveredOrders;

        res.json({
            totalOrders,
            totalSpent,
            deliveredOrders,
            pendingOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
