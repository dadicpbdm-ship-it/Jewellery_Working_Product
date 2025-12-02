const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin, delivery } = require('../middleware/authMiddleware');
const { assignDeliveryAgent, decrementActiveOrders } = require('../services/assignmentService');

const { optionalProtect } = require('../middleware/optionalAuthMiddleware');

// Create new order
router.post('/', optionalProtect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        guestInfo
    } = req.body;



    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        // Auto-save address if it doesn't exist
        if (req.user && shippingAddress) {
            console.log('[Address Auto-Save] Checking if address exists...');
            console.log('[Address Auto-Save] Current user addresses:', req.user.addresses);
            console.log('[Address Auto-Save] New shipping address:', shippingAddress);

            const addressExists = req.user.addresses.some(addr =>
                addr.address.toLowerCase() === shippingAddress.address.toLowerCase() &&
                addr.city.toLowerCase() === shippingAddress.city.toLowerCase() &&
                addr.postalCode === shippingAddress.postalCode
            );

            console.log('[Address Auto-Save] Address exists?', addressExists);

            if (!addressExists) {
                console.log('[Address Auto-Save] Saving new address...');
                req.user.addresses.push({
                    name: 'Saved Address', // Default name
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country
                });
                await req.user.save();
                console.log('[Address Auto-Save] Address saved successfully!');
            } else {
                console.log('[Address Auto-Save] Address already exists, skipping save.');
            }
        }

        const order = new Order({
            orderItems,
            user: req.user ? req.user._id : null,
            guestInfo: req.user ? undefined : guestInfo,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        // Assign delivery agent logic
        try {
            const assignedAgent = await assignDeliveryAgent(shippingAddress.city);
            if (assignedAgent) {
                order.deliveryAgent = assignedAgent._id;
                await decrementActiveOrders(assignedAgent._id);
                console.log(`[Order] Assigned delivery agent ${assignedAgent.name} to order.`);
            } else {
                console.log('[Order] No delivery agent available for this location.');
            }
        } catch (error) {
            console.error('[Order] Error assigning delivery agent:', error);
        }

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// Get logged in user orders
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// Get orders for delivery agent (All orders) - MUST be before /:id route
router.get('/delivery', protect, delivery, async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// Get all orders (Admin only) - MUST be before /:id route
router.get('/', protect, admin, async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').populate('deliveryAgent', 'name email');
    res.json(orders);
});

// Get order by ID - MUST be after specific routes
router.get('/:id', optionalProtect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Allow access if admin, delivery agent, the user who owns the order, OR if it's a guest order (no user)
        // For guest orders, we might want to secure this better in future (e.g. via token in email), 
        // but for now, if they have the ID, they can view it.
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// Update order to delivered
router.put('/:id/deliver', protect, delivery, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.isDelivered) {
                return res.status(400).json({ message: 'Order is already delivered' });
            }

            order.isDelivered = true;
            order.deliveredAt = Date.now();

            if (req.body.codPaymentReceived !== undefined) {
                order.codPaymentReceived = req.body.codPaymentReceived;
                if (req.body.codPaymentReceived) {
                    order.codPaymentReceivedAt = Date.now();
                    order.isPaid = true;
                    order.paidAt = Date.now();
                }
            }

            if (order.deliveryAgent) {
                await decrementActiveOrders(order.deliveryAgent);
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error updating order status: ${error.message}` });
    }
});

// Mark COD payment as received (Delivery agent only)
router.put('/:id/cod-payment', protect, delivery, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.paymentMethod !== 'Cash on Delivery') {
                return res.status(400).json({ message: 'This order is not a COD order' });
            }

            order.codPaymentReceived = true;
            order.codPaymentReceivedAt = Date.now();
            order.isPaid = true;
            order.paidAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment status' });
    }
});

module.exports = router;
