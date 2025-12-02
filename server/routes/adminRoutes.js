const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/analytics
// @desc    Get sales analytics data
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));

        // Get orders within period
        const orders = await Order.find({
            createdAt: { $gte: daysAgo }
        });

        // Calculate revenue by day
        const revenueByDay = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + order.totalPrice;
        });

        // Total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Order statistics
        const totalOrders = orders.length;
        const deliveredOrders = orders.filter(o => o.isDelivered).length;
        const pendingOrders = totalOrders - deliveredOrders;

        // Payment method breakdown
        const paymentMethods = {};
        orders.forEach(order => {
            const method = order.paymentMethod;
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });

        res.json({
            totalRevenue,
            totalOrders,
            deliveredOrders,
            pendingOrders,
            revenueByDay,
            paymentMethods,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});

// @route   GET /api/admin/top-products
// @desc    Get top selling products
// @access  Private/Admin
router.get('/top-products', protect, admin, async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        // Aggregate orders to find top products
        const orders = await Order.find({ isDelivered: true }).populate('orderItems.product');

        const productSales = {};
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product) {
                    const productId = item.product._id.toString();
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            product: item.product,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[productId].quantity += item.quantity;
                    productSales[productId].revenue += item.price * item.quantity;
                }
            });
        });

        // Sort by quantity and get top products
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, parseInt(limit));

        res.json(topProducts);
    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({ message: 'Server error fetching top products' });
    }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments();
        const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

        // Recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        res.json({
            totalProducts,
            totalUsers,
            totalOrders,
            lowStockProducts,
            recentOrders
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

module.exports = router;
