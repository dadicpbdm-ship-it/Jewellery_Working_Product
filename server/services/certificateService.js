const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Certificate Service
 * Handles certificate generation, blockchain hashing, and verification
 */

/**
 * Generate a unique certificate number
 */
const generateCertificateNumber = (productId) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const productSuffix = productId.toString().slice(-6).toUpperCase();
    return `CERT-${timestamp}-${productSuffix}-${random}`;
};

/**
 * Create a SHA-256 hash of the certificate data (simulating blockchain entry)
 */
const createBlockchainHash = (data) => {
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Generate QR code for certificate verification
 */
const generateQRCode = async (verificationUrl) => {
    try {
        return await QRCode.toDataURL(verificationUrl);
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

/**
 * Generate full certificate data for a product
 */
const generateCertificate = async (product, order, user) => {
    try {
        const certNumber = generateCertificateNumber(product._id);
        const issueDate = new Date();

        // Data to be hashed (immutable record)
        const certificateData = {
            certificateNumber: certNumber,
            productId: product._id,
            productName: product.name,
            category: product.category,
            material: product.material,
            purity: product.certification?.purity || 'Standard',
            weight: product.certification?.weight || 0,
            gemstones: product.certification?.diamondDetails || {},
            issuedTo: user.name,
            issueDate: issueDate.toISOString(),
            issuer: 'JewelIndia Authenticity Authority'
        };

        // Create hash
        const blockchainHash = createBlockchainHash(certificateData);

        // Verification URL (points to frontend verify page)
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate/${certNumber}`;

        // Generate QR Code
        const qrCode = await generateQRCode(verificationUrl);

        return {
            certificateNumber: certNumber,
            blockchainHash,
            qrCode,
            verificationUrl,
            issuedDate: issueDate,
            certificateType: product.certification?.certificateType || 'Internal',
            purity: product.certification?.purity,
            weight: product.certification?.weight,
            diamondDetails: product.certification?.diamondDetails
        };
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
};

/**
 * Verify a certificate hash
 */
const verifyCertificate = (certificateData, hash) => {
    const calculatedHash = createBlockchainHash(certificateData);
    return calculatedHash === hash;
};

module.exports = {
    generateCertificate,
    generateQRCode,
    createBlockchainHash,
    verifyCertificate
};
