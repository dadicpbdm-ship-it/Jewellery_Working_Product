import React from 'react';

const TierBadge = ({ tier, size = 'medium' }) => {
    const getTierColor = (tierName) => {
        switch (tierName) {
            case 'Platinum':
                return 'linear-gradient(135deg, #e5e4e2 0%, #b4b4b4 100%)';
            case 'Gold':
                return 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
            case 'Silver':
            default:
                return 'linear-gradient(135deg, #c0c0c0 0%, #a9a9a9 100%)';
        }
    };

    const getTierIcon = (tierName) => {
        switch (tierName) {
            case 'Platinum':
                return '💎';
            case 'Gold':
                return '👑';
            case 'Silver':
            default:
                return '⭐';
        }
    };

    const styles = {
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: getTierColor(tier),
            color: tier === 'Platinum' ? '#333' : '#fff',
            padding: size === 'small' ? '2px 8px' : '5px 12px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: size === 'small' ? '0.75rem' : '0.9rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        icon: {
            marginRight: '5px',
            fontSize: size === 'small' ? '0.8rem' : '1.1rem'
        }
    };

    return (
        <div style={styles.badge} title={`${tier} Member`}>
            <span style={styles.icon}>{getTierIcon(tier)}</span>
            {tier}
        </div>
    );
};

export default TierBadge;
