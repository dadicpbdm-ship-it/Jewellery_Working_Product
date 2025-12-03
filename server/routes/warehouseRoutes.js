const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const { protect, admin } = require('../middleware/authMiddleware');
const { checkProductAvailability, updateWarehouseStock } = require('../services/warehouseService');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const warehouses = await Warehouse.find({}).populate('inventory.product', 'name imageUrl price');
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching warehouses' });
    }
});

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id).populate('inventory.product', 'name imageUrl price');

        if (warehouse) {
            res.json(warehouse);
        } else {
            res.status(404).json({ message: 'Warehouse not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching warehouse' });
    }
});

// @desc    Find warehouse by pincode
// @route   GET /api/warehouses/pincode/:code
// @access  Public
router.get('/pincode/:code', async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPincode(req.params.code);

        if (warehouse) {
            res.json({
                id: warehouse._id,
                name: warehouse.name,
                code: warehouse.code,
                city: warehouse.location.city
            });
        } else {
            res.status(404).json({ message: 'No warehouse services this pincode' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, code, location, serviceablePincodes, manager } = req.body;

        const warehouseExists = await Warehouse.findOne({ code });
        if (warehouseExists) {
            return res.status(400).json({ message: 'Warehouse code already exists' });
        }

        const warehouse = await Warehouse.create({
            name,
            code,
            location,
            serviceablePincodes,
            manager,
            inventory: []
        });

        res.status(201).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating warehouse' });
    }
});

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);

        if (warehouse) {
            warehouse.name = req.body.name || warehouse.name;
            warehouse.code = req.body.code || warehouse.code;
            warehouse.location = req.body.location || warehouse.location;
            warehouse.serviceablePincodes = req.body.serviceablePincodes || warehouse.serviceablePincodes;
            warehouse.manager = req.body.manager || warehouse.manager;
            warehouse.isActive = req.body.isActive !== undefined ? req.body.isActive : warehouse.isActive;

            const updatedWarehouse = await warehouse.save();
            res.json(updatedWarehouse);
        } else {
            res.status(404).json({ message: 'Warehouse not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating warehouse' });
    }
});

// @desc    Update warehouse inventory
// @route   PUT /api/warehouses/:id/inventory
// @access  Private/Admin
router.put('/:id/inventory', protect, admin, async (req, res) => {
    try {
        const { productId, stock } = req.body;

        const result = await updateWarehouseStock(req.params.id, productId, stock);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);

        if (warehouse) {
            // Check if warehouse has inventory
            if (warehouse.inventory.length > 0) {
                return res.status(400).json({
                    message: 'Cannot delete warehouse with inventory. Please transfer stock first.'
                });
            }

            await warehouse.deleteOne();
            res.json({ message: 'Warehouse removed' });
        } else {
            res.status(404).json({ message: 'Warehouse not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting warehouse' });
    }
});

module.exports = router;
