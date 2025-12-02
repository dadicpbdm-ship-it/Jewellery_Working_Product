import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const ReferralCode = ({ code }) => {
    const { success } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        success('Referral code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on JewelIndia!',
                    text: `Use my referral code ${code} to get ₹500 off your first purchase!`,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    const styles = {
        container: {
            background: '#f8f9fa',
            border: '1px dashed #ced4da',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
            marginTop: '10px'
        },
        title: {
            fontSize: '0.9rem',
            color: '#6c757d',
            marginBottom: '8px'
        },
        codeBox: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px'
        },
        code: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#333',
            fontFamily: 'monospace'
        },
        actions: {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px'
        },
        button: {
            background: 'none',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: '#495057',
            transition: 'all 0.2s'
        },
        primaryButton: {
            background: '#007bff',
            color: 'white',
            border: 'none'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.title}>Your Referral Code</div>
            <div style={styles.codeBox}>
                <span style={styles.code}>{code}</span>
            </div>
            <div style={styles.actions}>
                <button
                    style={{ ...styles.button, ...(copied ? { background: '#28a745', color: 'white', borderColor: '#28a745' } : {}) }}
                    onClick={handleCopy}
                >
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button style={styles.button} onClick={handleShare}>
                    Share
                </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '10px' }}>
                Give ₹500, Get ₹500! Share with friends.
            </p>
        </div>
    );
};

export default ReferralCode;
