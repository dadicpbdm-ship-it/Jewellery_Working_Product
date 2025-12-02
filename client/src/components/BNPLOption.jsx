import React from 'react';

const BNPLOption = ({ selected, onSelect, provider, logo, installments }) => {
    const styles = {
        container: {
            border: selected ? '2px solid #007bff' : '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            cursor: 'pointer',
            background: selected ? '#f8f9fa' : 'white',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
        },
        left: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        radio: {
            width: '18px',
            height: '18px',
            cursor: 'pointer'
        },
        info: {
            display: 'flex',
            flexDirection: 'column'
        },
        name: {
            fontWeight: '600',
            color: '#333'
        },
        details: {
            fontSize: '0.85rem',
            color: '#666'
        },
        badge: {
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
        }
    };

    return (
        <div style={styles.container} onClick={onSelect}>
            <div style={styles.left}>
                <input
                    type="radio"
                    checked={selected}
                    onChange={onSelect}
                    style={styles.radio}
                />
                <div style={styles.info}>
                    <span style={styles.name}>{provider}</span>
                    <span style={styles.details}>Pay in {installments} interest-free installments</span>
                </div>
            </div>
            <span style={styles.badge}>No Interest</span>
        </div>
    );
};

export default BNPLOption;
