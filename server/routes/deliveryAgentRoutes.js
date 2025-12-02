const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// Register new delivery agent (Admin only)
router.post('/register', protect, admin, async (req, res) => {
    try {
        const { name, email, password, phone, assignedArea } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create delivery agent
        const deliveryAgent = await User.create({
            name,
            email,
            password,
            role: 'delivery',
            phone,
            assignedArea: assignedArea || ''
        });

        if (deliveryAgent) {
            res.status(201).json({
                _id: deliveryAgent._id,
                name: deliveryAgent.name,
                email: deliveryAgent.email,
                role: deliveryAgent.role,
                phone: deliveryAgent.phone,
                assignedArea: deliveryAgent.assignedArea
            });
        } else {
            res.status(400).json({ message: 'Invalid delivery agent data' });
        }
    } catch (error) {
        console.error('Error creating delivery agent:', error);
        res.status(500).json({ message: 'Error creating delivery agent' });
    }
});

// Get all delivery agents (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const deliveryAgents = await User.find({ role: 'delivery' }).select('-password');

        // Calculate active orders dynamically
        const agentsWithStats = await Promise.all(deliveryAgents.map(async (agent) => {
            const activeOrdersCount = await require('../models/Order').countDocuments({
                deliveryAgent: agent._id,
                isDelivered: false
            });

            const deliveredOrdersCount = await require('../models/Order').countDocuments({
                deliveryAgent: agent._id,
                isDelivered: true
            });

            return {
                ...agent.toObject(),
                activeOrders: activeOrdersCount,
                totalDelivered: deliveredOrdersCount,
                totalAssigned: activeOrdersCount + deliveredOrdersCount
            };
        }));

        res.json(agentsWithStats);
    } catch (error) {
        console.error('Error fetching delivery agents:', error);
        res.status(500).json({ message: 'Error fetching delivery agents' });
    }
});

// Update delivery agent status (Admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { isActive } = req.body;
        const deliveryAgent = await User.findById(req.params.id);

        if (deliveryAgent && deliveryAgent.role === 'delivery') {
            deliveryAgent.isActive = isActive;
            const updatedAgent = await deliveryAgent.save();
            res.json(updatedAgent);
        } else {
            res.status(404).json({ message: 'Delivery agent not found' });
        }
    } catch (error) {
        console.error('Error updating delivery agent:', error);
        res.status(500).json({ message: 'Error updating delivery agent' });
    }
});

// Update delivery agent details (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, email, phone, assignedArea } = req.body;
        const deliveryAgent = await User.findById(req.params.id);

        if (deliveryAgent && deliveryAgent.role === 'delivery') {
            deliveryAgent.name = name || deliveryAgent.name;
            deliveryAgent.email = email || deliveryAgent.email;
            deliveryAgent.phone = phone || deliveryAgent.phone;
            deliveryAgent.assignedArea = assignedArea !== undefined ? assignedArea : deliveryAgent.assignedArea;

            const updatedAgent = await deliveryAgent.save();
            res.json(updatedAgent);
        } else {
            res.status(404).json({ message: 'Delivery agent not found' });
        }
    } catch (error) {
        console.error('Error updating delivery agent:', error);
        res.status(500).json({ message: 'Error updating delivery agent' });
    }
});

module.exports = router;
