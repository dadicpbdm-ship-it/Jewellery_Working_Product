const express = require('express');
const router = express.Router();
const Pincode = require('../models/Pincode');
const { protect, admin } = require('../middleware/authMiddleware');
const { checkProductAvailability } = require('../services/warehouseService');

// @desc    Check if pincode is serviceable (with optional product stock check)
// @route   GET /api/pincodes/check/:code?productId=xxx
// @access  Public
router.get('/check/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { productId } = req.query;

        const pincode = await Pincode.findOne({ code, isActive: true });

        if (pincode) {
            const response = {
                serviceable: true,
                deliveryDays: pincode.deliveryDays,
                codAvailable: pincode.codAvailable,
                city: pincode.city,
                state: pincode.state
            };

            // If productId provided, check warehouse stock
            if (productId) {
                const stockInfo = await checkProductAvailability(productId, code);
                response.inStock = stockInfo.available;
                response.stockMessage = stockInfo.reason;
                response.warehouse = stockInfo.warehouse;
            }

            res.json(response);
        } else {
            res.status(404).json({
                serviceable: false,
                message: 'Pincode not serviceable'
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error checking pincode' });
    }
});

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const pincodes = await Pincode.find({}).sort({ code: 1 });
        res.json(pincodes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pincodes' });
    }
});

// @desc    Add new pincode
// @route   POST /api/pincodes
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { code, city, state, deliveryDays, codAvailable } = req.body;

        const pincodeExists = await Pincode.findOne({ code });
        if (pincodeExists) {
            return res.status(400).json({ message: 'Pincode already exists' });
        }

        const pincode = await Pincode.create({
            code,
            city,
            state,
            deliveryDays,
            codAvailable
        });

        res.status(201).json(pincode);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding pincode' });
    }
});

// @desc    Update pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const pincode = await Pincode.findById(req.params.id);

        if (pincode) {
            pincode.code = req.body.code || pincode.code;
            pincode.city = req.body.city || pincode.city;
            pincode.state = req.body.state || pincode.state;
            pincode.deliveryDays = req.body.deliveryDays || pincode.deliveryDays;
            pincode.isActive = req.body.isActive !== undefined ? req.body.isActive : pincode.isActive;
            pincode.codAvailable = req.body.codAvailable !== undefined ? req.body.codAvailable : pincode.codAvailable;

            const updatedPincode = await pincode.save();
            res.json(updatedPincode);
        } else {
            res.status(404).json({ message: 'Pincode not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating pincode' });
    }
});

// @desc    Delete pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const pincode = await Pincode.findById(req.params.id);

        if (pincode) {
            await pincode.deleteOne();
            res.json({ message: 'Pincode removed' });
        } else {
            res.status(404).json({ message: 'Pincode not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting pincode' });
    }
});

module.exports = router;
