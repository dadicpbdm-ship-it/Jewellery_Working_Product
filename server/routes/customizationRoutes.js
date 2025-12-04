const express = require('express');
const router = express.Router();

// Available fonts for engraving
const ENGRAVING_FONTS = [
    { id: 'serif', name: 'Classic Serif', preview: 'ABCabc123' },
    { id: 'script', name: 'Elegant Script', preview: 'ABCabc123' },
    { id: 'modern', name: 'Modern Sans', preview: 'ABCabc123' },
    { id: 'cursive', name: 'Handwritten', preview: 'ABCabc123' }
];

// @route   GET /api/customizations/fonts
// @desc    Get available engraving fonts
// @access  Public
router.get('/fonts', (req, res) => {
    res.json(ENGRAVING_FONTS);
});

// @route   POST /api/customizations/validate
// @desc    Validate customization options
// @access  Public
router.post('/validate', async (req, res) => {
    try {
        const { productId, engraving, size, materialVariant } = req.body;
        const Product = require('../models/Product');

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const errors = [];

        // Validate engraving
        if (engraving && engraving.text) {
            if (!product.customizationOptions.allowEngraving) {
                errors.push('Engraving not available for this product');
            } else if (engraving.text.length > product.customizationOptions.maxEngravingChars) {
                errors.push(`Engraving text exceeds maximum length of ${product.customizationOptions.maxEngravingChars} characters`);
            }
        }

        // Validate size
        if (size && product.customizationOptions.availableSizes.length > 0) {
            if (!product.customizationOptions.availableSizes.includes(size)) {
                errors.push('Invalid size selected');
            }
        }

        // Validate material variant
        if (materialVariant) {
            const variant = product.customizationOptions.materialVariants.find(
                v => v.material === materialVariant
            );
            if (!variant || !variant.available) {
                errors.push('Invalid or unavailable material variant');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ valid: false, errors });
        }

        res.json({ valid: true, message: 'Customization options are valid' });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ message: 'Server error validating customization' });
    }
});

// @route   POST /api/customizations/calculate-price
// @desc    Calculate total price with customization
// @access  Public
router.post('/calculate-price', async (req, res) => {
    try {
        const { productId, engraving, materialVariant } = req.body;
        const Product = require('../models/Product');

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let totalPrice = product.price;
        let breakdown = {
            basePrice: product.price,
            engravingCost: 0,
            materialAdjustment: 0
        };

        // Add engraving cost
        if (engraving && engraving.text && product.customizationOptions.allowEngraving) {
            breakdown.engravingCost = product.customizationOptions.engravingPrice;
            totalPrice += breakdown.engravingCost;
        }

        // Add material variant adjustment
        if (materialVariant) {
            const variant = product.customizationOptions.materialVariants.find(
                v => v.material === materialVariant
            );
            if (variant) {
                breakdown.materialAdjustment = variant.priceAdjustment;
                totalPrice += breakdown.materialAdjustment;
            }
        }

        res.json({
            totalPrice,
            breakdown
        });
    } catch (error) {
        console.error('Price calculation error:', error);
        res.status(500).json({ message: 'Server error calculating price' });
    }
});

module.exports = router;
