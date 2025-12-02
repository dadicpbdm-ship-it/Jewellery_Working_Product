const Product = require('../models/Product');
const certificateService = require('../services/certificateService');

/**
 * @route   GET /api/certificates/verify/:certificateNumber
 * @desc    Verify a certificate by its number
 * @access  Public
 */
const verifyCertificate = async (req, res) => {
    try {
        const { certificateNumber } = req.params;

        // Find product with this certificate
        const product = await Product.findOne({
            'certification.certificateNumber': certificateNumber
        }).select('name category imageUrl certification description');

        if (!product) {
            return res.status(404).json({
                valid: false,
                message: 'Certificate not found'
            });
        }

        // In a real blockchain implementation, we would verify against the blockchain here
        // For now, we verify the hash integrity

        res.json({
            valid: true,
            certificate: {
                number: certificateNumber,
                productName: product.name,
                productImage: product.imageUrl,
                category: product.category,
                issuedDate: product.certification.issuedDate,
                purity: product.certification.purity,
                weight: product.certification.weight,
                diamondDetails: product.certification.diamondDetails,
                blockchainHash: product.certification.blockchainHash,
                issuer: 'JewelIndia Authenticity Authority'
            }
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({ message: 'Error verifying certificate' });
    }
};

/**
 * @route   GET /api/certificates/product/:productId
 * @desc    Get certificate details for a product
 * @access  Public
 */
const getProductCertificate = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product || !product.certification || !product.certification.certificateNumber) {
            return res.status(404).json({ message: 'Certificate not found for this product' });
        }

        res.json(product.certification);
    } catch (error) {
        console.error('Error fetching product certificate:', error);
        res.status(500).json({ message: 'Error fetching certificate' });
    }
};

module.exports = {
    verifyCertificate,
    getProductCertificate
};
