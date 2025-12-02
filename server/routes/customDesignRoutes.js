const express = require('express');
const router = express.Router();
const {
    createDesign,
    getMyDesigns,
    getDesignById,
    updateDesign,
    deleteDesign
} = require('../controllers/customDesignController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createDesign);

router.route('/my-designs')
    .get(protect, getMyDesigns);

router.route('/:id')
    .get(protect, getDesignById)
    .put(protect, updateDesign)
    .delete(protect, deleteDesign);

module.exports = router;
