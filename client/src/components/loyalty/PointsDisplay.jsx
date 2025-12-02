import React from 'react';

const PointsDisplay = ({ points, size = 'medium', showLabel = true }) => {
    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif",
        },
        icon: {
            color: '#FFD700',
            fontSize: size === 'large' ? '1.5rem' : size === 'small' ? '0.9rem' : '1.2rem',
            marginRight: '5px',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
        },
        points: {
            fontWeight: 'bold',
            fontSize: size === 'large' ? '1.8rem' : size === 'small' ? '1rem' : '1.2rem',
            color: '#333'
        },
        label: {
            fontSize: size === 'large' ? '1rem' : size === 'small' ? '0.7rem' : '0.8rem',
            color: '#666',
            marginLeft: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }
    };

    return (
        <div style={styles.container} title="Loyalty Points">
            <span style={styles.icon}>🪙</span>
            <span style={styles.points}>{points.toLocaleString()}</span>
            {showLabel && <span style={styles.label}>Points</span>}
        </div>
    );
};

export default PointsDisplay;
