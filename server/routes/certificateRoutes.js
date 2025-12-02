const express = require('express');
const router = express.Router();
const { verifyCertificate, getProductCertificate } = require('../controllers/certificateController');

// Public routes
router.get('/verify/:certificateNumber', verifyCertificate);
router.get('/product/:productId', getProductCertificate);

module.exports = router;
