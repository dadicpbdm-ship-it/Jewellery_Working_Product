import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import LoadingSpinner from '../components/LoadingSpinner';

const CertificateVerify = () => {
    const { certificateNumber } = useParams();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState(null);
    const [searchId, setSearchId] = useState(certificateNumber || '');

    useEffect(() => {
        if (certificateNumber) {
            verifyCertificate(certificateNumber);
        } else {
            setLoading(false);
        }
    }, [certificateNumber]);

    const verifyCertificate = async (certNum) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/certificates/verify/${certNum}`);
            const data = await response.json();

            if (response.ok && data.valid) {
                setCertificate(data.certificate);
            } else {
                setError(data.message || 'Invalid Certificate');
                setCertificate(null);
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Unable to verify certificate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchId.trim()) {
            verifyCertificate(searchId.trim());
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '40px auto',
            padding: '20px',
            fontFamily: "'Inter', sans-serif"
        },
        searchBox: {
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            textAlign: 'center',
            marginBottom: '40px'
        },
        input: {
            padding: '12px 20px',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            width: '60%',
            marginRight: '10px',
            outline: 'none'
        },
        button: {
            padding: '12px 25px',
            background: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
        },
        certCard: {
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            position: 'relative'
        },
        certHeader: {
            background: '#1a1a1a',
            color: '#d4af37', // Gold color
            padding: '30px',
            textAlign: 'center',
            borderBottom: '4px solid #d4af37'
        },
        certTitle: {
            margin: 0,
            fontSize: '2rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: "'Playfair Display', serif"
        },
        certSubtitle: {
            margin: '10px 0 0',
            fontSize: '0.9rem',
            opacity: 0.8,
            letterSpacing: '1px'
        },
        certBody: {
            padding: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px'
        },
        productImage: {
            width: '200px',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid #eee'
        },
        details: {
            flex: 1,
            minWidth: '300px'
        },
        row: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            borderBottom: '1px dashed #eee',
            paddingBottom: '5px'
        },
        label: {
            color: '#666',
            fontWeight: '500'
        },
        value: {
            fontWeight: 'bold',
            color: '#333'
        },
        hashBox: {
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            fontSize: '0.8rem',
            wordBreak: 'break-all',
            border: '1px solid #eee'
        },
        verifiedBadge: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#28a745',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        },
        error: {
            textAlign: 'center',
            color: '#dc3545',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.searchBox}>
                <h2 style={{ marginBottom: '20px' }}>Verify Authenticity</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    Enter the certificate number found on your product card or scan the QR code.
                </p>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Enter Certificate Number (e.g., CERT-123...)"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Verify</button>
                </form>
            </div>

            {loading && <LoadingSpinner />}

            {error && (
                <div style={styles.error}>
                    <h3>❌ Verification Failed</h3>
                    <p>{error}</p>
                </div>
            )}

            {certificate && (
                <div style={styles.certCard}>
                    <div style={styles.verifiedBadge}>
                        ✓ VERIFIED AUTHENTIC
                    </div>
                    <div style={styles.certHeader}>
                        <h1 style={styles.certTitle}>Certificate of Authenticity</h1>
                        <p style={styles.certSubtitle}>{certificate.issuer}</p>
                    </div>

                    <div style={styles.certBody}>
                        <img
                            src={certificate.productImage}
                            alt={certificate.productName}
                            style={styles.productImage}
                        />

                        <div style={styles.details}>
                            <div style={styles.row}>
                                <span style={styles.label}>Certificate Number</span>
                                <span style={styles.value}>{certificate.number}</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.label}>Product Name</span>
                                <span style={styles.value}>{certificate.productName}</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.label}>Category</span>
                                <span style={styles.value}>{certificate.category}</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.label}>Material Purity</span>
                                <span style={styles.value}>{certificate.purity}</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.label}>Weight</span>
                                <span style={styles.value}>{certificate.weight}g</span>
                            </div>
                            {certificate.diamondDetails && (
                                <>
                                    <div style={styles.row}>
                                        <span style={styles.label}>Diamond Carat</span>
                                        <span style={styles.value}>{certificate.diamondDetails.carat} ct</span>
                                    </div>
                                    <div style={styles.row}>
                                        <span style={styles.label}>Diamond Quality</span>
                                        <span style={styles.value}>{certificate.diamondDetails.color} / {certificate.diamondDetails.clarity}</span>
                                    </div>
                                </>
                            )}
                            <div style={styles.row}>
                                <span style={styles.label}>Issue Date</span>
                                <span style={styles.value}>{new Date(certificate.issuedDate).toLocaleDateString()}</span>
                            </div>

                            <div style={styles.hashBox}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Blockchain Hash (SHA-256):</div>
                                <code style={{ color: '#666' }}>{certificate.blockchainHash}</code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateVerify;
