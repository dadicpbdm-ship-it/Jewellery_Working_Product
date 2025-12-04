const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin, delivery } = require('../middleware/authMiddleware');
const { assignDeliveryAgent, decrementActiveOrders } = require('../services/assignmentService');
const whatsappService = require('../services/whatsappService');

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
        guestInfo,
        rewardPointsUsed // New field for hybrid payment
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
            totalPrice,
            // Add reward points info
            rewardPointsUsed: rewardPointsUsed || { points: 0, discountAmount: 0 },
            amountPaidByPoints: rewardPointsUsed ? rewardPointsUsed.discountAmount : 0,
            amountPaidByPaymentMethod: rewardPointsUsed ? (totalPrice - rewardPointsUsed.discountAmount) : totalPrice
        });

        // Assign delivery agent logic
        try {
            const assignedAgent = await assignDeliveryAgent(shippingAddress.city, shippingAddress.postalCode);
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

        // Deduct reward points if used (only for logged-in users)
        if (req.user && rewardPointsUsed && rewardPointsUsed.points > 0) {
            try {
                const loyaltyService = require('../services/loyaltyService');
                await loyaltyService.deductPointsForOrder(
                    req.user._id,
                    rewardPointsUsed.points,
                    createdOrder._id
                );
                console.log(`[Order] Deducted ${rewardPointsUsed.points} reward points for order ${createdOrder._id}`);
            } catch (error) {
                console.error('[Order] Error deducting reward points:', error);
                // Rollback order if points deduction fails
                await Order.findByIdAndDelete(createdOrder._id);
                return res.status(400).json({
                    message: 'Failed to process reward points. Please try again.',
                    error: error.message
                });
            }
        }

        // Award loyalty points for logged-in users (based on amount paid, not points used)
        if (req.user) {
            try {
                const loyaltyService = require('../services/loyaltyService');
                const amountForPoints = order.amountPaidByPaymentMethod;
                if (amountForPoints > 0) {
                    await loyaltyService.awardPoints(req.user._id, amountForPoints, createdOrder._id);
                }
            } catch (error) {
                console.error('[Order] Error awarding loyalty points:', error);
                // Don't fail the order if loyalty points fail
            }
        }

        // Send WhatsApp Confirmation
        try {
            const userForNotify = req.user || { name: guestInfo.name, phone: guestInfo.phone };
            await whatsappService.sendOrderConfirmation(createdOrder, userForNotify);
        } catch (error) {
            console.error('[Order] Error sending WhatsApp confirmation:', error);
        }

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

            // Generate Blockchain Certificates for products
            try {
                const certificateService = require('../services/certificateService');
                const Product = require('../models/Product');

                // Get full order with product details
                const fullOrder = await Order.findById(req.params.id).populate('orderItems.product');

                for (const item of fullOrder.orderItems) {
                    if (item.product) {
                        const product = await Product.findById(item.product._id);
                        // Only generate if not already generated
                        if (product && !product.certification?.certificateNumber) {
                            const certData = await certificateService.generateCertificate(
                                product,
                                fullOrder,
                                fullOrder.user ? await require('../models/User').findById(fullOrder.user) : { name: fullOrder.guestInfo.name }
                            );

                            product.certification = {
                                ...product.certification,
                                ...certData
                            };
                            await product.save();
                        }
                    }
                }
            } catch (error) {
                console.error('Error generating certificates:', error);
                // Don't fail delivery update if certificate generation fails
            }

            const updatedOrder = await order.save();

            // Send WhatsApp Delivery Notification
            try {
                const User = require('../models/User');
                const userForNotify = updatedOrder.user ? await User.findById(updatedOrder.user) : { name: updatedOrder.guestInfo.name, phone: updatedOrder.guestInfo.phone };
                await whatsappService.sendOrderDelivered(updatedOrder, userForNotify);
            } catch (error) {
                console.error('[Order] Error sending WhatsApp delivery notification:', error);
            }

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

// Submit Return/Exchange Request (User)
router.post('/:id/return-exchange', protect, async (req, res) => {
    try {
        const { type, reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if user owns the order
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to request return/exchange for this order' });
            }

            if (!order.isDelivered) {
                return res.status(400).json({ message: 'Cannot request return/exchange for undelivered orders' });
            }

            if (order.returnExchangeRequest && order.returnExchangeRequest.type !== 'None') {
                return res.status(400).json({ message: 'Return/Exchange request already exists' });
            }

            order.returnExchangeRequest = {
                type,
                reason,
                status: 'Pending',
                requestDate: Date.now()
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error submitting request: ${error.message}` });
    }
});

// Update Return/Exchange Status (Admin or Delivery Agent for Completion)
router.put('/:id/return-exchange-status', protect, async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            // Permission Check
            const isAdmin = req.user.role === 'admin';
            const isDelivery = req.user.role === 'delivery';

            if (!isAdmin && !isDelivery) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            // Delivery agents can only mark as Completed
            if (isDelivery && status !== 'Completed') {
                return res.status(403).json({ message: 'Delivery agents can only mark returns as Completed' });
            }

            if (order.returnExchangeRequest.type === 'None') {
                return res.status(400).json({ message: 'No return/exchange request found for this order' });
            }

            order.returnExchangeRequest.status = status;
            if (adminComment && isAdmin) {
                order.returnExchangeRequest.adminComment = adminComment;
            }

            // Auto-process refund if Return is Completed
            if (status === 'Completed' && order.returnExchangeRequest.type === 'Return') {
                order.isRefunded = true;
                order.refundedAt = Date.now();
                console.log(`[Refund] Processed refund for Order ${order._id}`);
            }

            const updatedOrder = await order.save();

            // Send WhatsApp Return/Exchange Update
            try {
                const User = require('../models/User');
                const userForNotify = updatedOrder.user ? await User.findById(updatedOrder.user) : { name: updatedOrder.guestInfo.name, phone: updatedOrder.guestInfo.phone };
                await whatsappService.sendReturnRequestUpdate(updatedOrder, userForNotify);
            } catch (error) {
                console.error('[Order] Error sending WhatsApp return update:', error);
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error updating status: ${error.message}` });
    }
});

module.exports = router;
