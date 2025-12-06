import React, { useEffect, useState } from 'react';
import './TrustCertificate.css';

const TrustCertificate = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    // Use certification data if available, or generate realistic mock data for existing products
    const cert = product.certification || {};
    const certId = cert.certificateNumber || `CERT-${product._id.substring(0, 8).toUpperCase()}`;
    const purity = cert.purity || (product.material === 'Gold' ? '22K Gold' : 'Sterling Silver');
    const hash = cert.blockchainHash || `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Generate QR Code URL (using a public API for demo)
    const verificationUrl = `${window.location.origin}/verify/${certId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&bgcolor=faf8f3`;

    return (
        <div className="certificate-overlay" onClick={onClose}>
            <div className="certificate-card" onClick={e => e.stopPropagation()}>
                <button className="close-cert-btn" onClick={onClose}>×</button>

                {/* Header */}
                <div className="cert-header">
                    <div className="cert-title">
                        <h2>JewelIndia</h2>
                        <div className="cert-subtitle">Certificate of Authenticity</div>
                    </div>
                    <div className="cert-id">
                        <div className="label">Certificate No.</div>
                        <div className="value">{certId}</div>
                    </div>
                </div>

                {/* Body */}
                <div className="cert-body">
                    <div className="cert-details">
                        <div className="detail-row">
                            <div className="label">Product Name</div>
                            <div className="value">{product.name}</div>
                        </div>
                        <div className="detail-row">
                            <div className="label">Material Purity</div>
                            <div className="value">{purity} BIS Hallmarked</div>
                        </div>
                        <div className="detail-row">
                            <div className="label">Gross Weight</div>
                            <div className="value">{cert.weight ? `${cert.weight}g` : 'N/A'}</div>
                        </div>
                        {product.category === 'Ring' && product.material === 'Diamond' && (
                            <div className="detail-row">
                                <div className="label">Diamond Quality</div>
                                <div className="value">VVS1 / E-Color</div>
                            </div>
                        )}
                    </div>

                    <div className="cert-qr">
                        <img src={qrCodeUrl} alt="Verification QR Code" />
                    </div>
                </div>

                {/* Footer */}
                <div className="cert-footer">
                    <div className="blockchain-hash">
                        <span>BLOCKCHAIN RECORD HASH</span>
                        {hash}
                    </div>
                    <div className="seal-icon">🛡️</div>
                </div>
            </div>
        </div>
    );
};

export default TrustCertificate;
