const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts, updateContactStatus } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - anyone can submit a contact form
router.post('/', submitContact);

// Admin routes - protected
router.get('/', protect, admin, getAllContacts);
router.put('/:id', protect, admin, updateContactStatus);

module.exports = router;
