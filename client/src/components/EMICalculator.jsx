import React, { useState } from 'react';

const EMICalculator = ({ price }) => {
    const [provider, setProvider] = useState('Simpl');

    const providers = {
        Simpl: {
            name: 'Simpl',
            logo: 'https://assets.getsimpl.com/images/simpl-logo.svg',
            installments: 3,
            interest: 0
        },
        LazyPay: {
            name: 'LazyPay',
            logo: 'https://lazypay.in/static/images/lazypay-logo.svg',
            installments: 3,
            interest: 0
        },
        ZestMoney: {
            name: 'ZestMoney',
            logo: 'https://assets.zestmoney.in/assets/images/logo.svg',
            installments: 6,
            interest: 0
        }
    };

    const currentProvider = providers[provider];
    const monthlyAmount = Math.ceil(price / currentProvider.installments);

    const styles = {
        container: {
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '15px',
            border: '1px solid #e9ecef'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
        },
        title: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333',
            margin: 0
        },
        providerSelect: {
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '0.85rem'
        },
        calculation: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        amount: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#28a745'
        },
        details: {
            fontSize: '0.85rem',
            color: '#666'
        },
        badge: {
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            marginLeft: '8px',
            fontWeight: '500'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h4 style={styles.title}>Buy Now, Pay Later</h4>
                <select
                    style={styles.providerSelect}
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                >
                    {Object.keys(providers).map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>
            <div style={styles.calculation}>
                <span style={styles.amount}>₹{monthlyAmount.toLocaleString()}</span>
                <span style={styles.details}>
                    x {currentProvider.installments} months
                    <span style={styles.badge}>No Interest</span>
                </span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#888' }}>
                Pay 1/3rd now, rest later with {provider}. No hidden fees.
            </p>
        </div>
    );
};

export default EMICalculator;
