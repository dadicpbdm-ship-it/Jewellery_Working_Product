const CustomDesign = require('../models/CustomDesign');

// @desc    Create a new custom design
// @route   POST /api/custom-designs
// @access  Private
const createDesign = async (req, res) => {
    try {
        const { type, metal, gemstone, gemstoneSize, engravingText, size, estimatedPrice, name } = req.body;

        const design = new CustomDesign({
            user: req.user._id,
            name,
            type,
            metal,
            gemstone,
            gemstoneSize,
            engravingText,
            size,
            estimatedPrice,
            status: 'draft'
        });

        const createdDesign = await design.save();
        res.status(201).json(createdDesign);
    } catch (error) {
        console.error('Error creating design:', error);
        res.status(500).json({ message: 'Error creating design' });
    }
};

// @desc    Get all designs for a user
// @route   GET /api/custom-designs/my-designs
// @access  Private
const getMyDesigns = async (req, res) => {
    try {
        const designs = await CustomDesign.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(designs);
    } catch (error) {
        console.error('Error fetching designs:', error);
        res.status(500).json({ message: 'Error fetching designs' });
    }
};

// @desc    Get a single design by ID
// @route   GET /api/custom-designs/:id
// @access  Private
const getDesignById = async (req, res) => {
    try {
        const design = await CustomDesign.findById(req.params.id);

        if (design) {
            // Ensure user owns the design
            if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to view this design' });
            }
            res.json(design);
        } else {
            res.status(404).json({ message: 'Design not found' });
        }
    } catch (error) {
        console.error('Error fetching design:', error);
        res.status(500).json({ message: 'Error fetching design' });
    }
};

// @desc    Update a design
// @route   PUT /api/custom-designs/:id
// @access  Private
const updateDesign = async (req, res) => {
    try {
        const design = await CustomDesign.findById(req.params.id);

        if (design) {
            if (design.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this design' });
            }

            design.name = req.body.name || design.name;
            design.type = req.body.type || design.type;
            design.metal = req.body.metal || design.metal;
            design.gemstone = req.body.gemstone || design.gemstone;
            design.gemstoneSize = req.body.gemstoneSize || design.gemstoneSize;
            design.engravingText = req.body.engravingText || design.engravingText;
            design.size = req.body.size || design.size;
            design.estimatedPrice = req.body.estimatedPrice || design.estimatedPrice;
            design.status = req.body.status || design.status;
            design.previewImage = req.body.previewImage || design.previewImage;

            const updatedDesign = await design.save();
            res.json(updatedDesign);
        } else {
            res.status(404).json({ message: 'Design not found' });
        }
    } catch (error) {
        console.error('Error updating design:', error);
        res.status(500).json({ message: 'Error updating design' });
    }
};

// @desc    Delete a design
// @route   DELETE /api/custom-designs/:id
// @access  Private
const deleteDesign = async (req, res) => {
    try {
        const design = await CustomDesign.findById(req.params.id);

        if (design) {
            if (design.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this design' });
            }

            await design.deleteOne();
            res.json({ message: 'Design removed' });
        } else {
            res.status(404).json({ message: 'Design not found' });
        }
    } catch (error) {
        console.error('Error deleting design:', error);
        res.status(500).json({ message: 'Error deleting design' });
    }
};

module.exports = {
    createDesign,
    getMyDesigns,
    getDesignById,
    updateDesign,
    deleteDesign
};
