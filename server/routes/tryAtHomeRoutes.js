const express = require('express');
const router = express.Router();
const TryAtHomeRequest = require('../models/TryAtHomeRequest');
const { protect, admin, delivery } = require('../middleware/authMiddleware');
const whatsappService = require('../services/whatsappService');

// Create new request
router.post('/', protect, async (req, res) => {
    try {
        const { products, address, scheduledDate, scheduledTimeSlot } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No products selected' });
        }

        const request = new TryAtHomeRequest({
            user: req.user._id,
            products,
            address,
            scheduledDate,
            scheduledTimeSlot
        });

        const createdRequest = await request.save();

        // Send WhatsApp Notification
        try {
            const message = `🏠 *Try at Home Requested!*
            
Hi ${req.user.name},
We received your request to try ${products.length} items at home.

Date: ${new Date(scheduledDate).toLocaleDateString()}
Time: ${scheduledTimeSlot}

We will confirm your slot shortly!`;

            await whatsappService.sendWhatsAppMessage(req.user.phone, message);
        } catch (error) {
            console.error('Error sending WhatsApp:', error);
        }

        res.status(201).json(createdRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get requests (User: own, Admin: all, Delivery: assigned)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'admin') {
            query = {}; // Admin sees all
        } else if (req.user.role === 'delivery') {
            query = { assignedAgent: req.user._id }; // Agent sees assigned
        } else {
            query = { user: req.user._id }; // User sees own
        }

        const requests = await TryAtHomeRequest.find(query)
            .populate('user', 'name email phone')
            .populate('products', 'name price image')
            .populate('assignedAgent', 'name phone')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update status / Assign Agent (Admin/Delivery)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status, assignedAgent, adminComment, agentComment } = req.body;
        const request = await TryAtHomeRequest.findById(req.params.id).populate('user');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Authorization Check
        if (req.user.role !== 'admin' && req.user.role !== 'delivery') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delivery Agent Restrictions
        if (req.user.role === 'delivery') {
            if (request.assignedAgent?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized for this task' });
            }
            // Agents can only mark Completed or add comments
            if (status && status !== 'Completed') {
                return res.status(400).json({ message: 'Agents can only mark as Completed' });
            }
        }

        if (status) request.status = status;
        if (assignedAgent && req.user.role === 'admin') request.assignedAgent = assignedAgent;
        if (adminComment && req.user.role === 'admin') request.adminComment = adminComment;
        if (agentComment) request.agentComment = agentComment;

        const updatedRequest = await request.save();

        // Notifications
        if (status === 'Approved' && assignedAgent) {
            try {
                const message = `✅ *Try at Home Approved!*
            
Hi ${request.user.name},
Your request has been approved!

Agent assigned will visit you on:
${new Date(request.scheduledDate).toLocaleDateString()} (${request.scheduledTimeSlot})`;

                await whatsappService.sendWhatsAppMessage(request.user.phone, message);
            } catch (error) {
                console.error('Error sending WhatsApp:', error);
            }
        }

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
