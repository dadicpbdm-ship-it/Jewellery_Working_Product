import React from 'react';

const DesignGallery = ({ onSelectDesign }) => {
    const TRENDING_DESIGNS = [
        {
            id: 1,
            name: 'Eternal Sparkle',
            metal: 'Platinum',
            gemstone: 'Diamond',
            gemstoneSize: 1.5,
            size: 10,
            price: 85000,
            likes: 234,
            image: '💎',
            trending: true
        },
        {
            id: 2,
            name: 'Ruby Romance',
            metal: 'Rose Gold',
            gemstone: 'Ruby',
            gemstoneSize: 2.0,
            size: 10,
            price: 65000,
            likes: 189,
            image: '❤️',
            trending: true
        },
        {
            id: 3,
            name: 'Sapphire Dreams',
            metal: 'White Gold',
            gemstone: 'Sapphire',
            gemstoneSize: 1.8,
            size: 10,
            price: 58000,
            likes: 156,
            image: '💙',
            trending: false
        },
        {
            id: 4,
            name: 'Emerald Elegance',
            metal: 'Gold',
            gemstone: 'Emerald',
            gemstoneSize: 1.2,
            size: 10,
            price: 48000,
            likes: 142,
            image: '💚',
            trending: false
        },
        {
            id: 5,
            name: 'Minimalist Gold',
            metal: 'Gold',
            gemstone: 'None',
            gemstoneSize: 0,
            size: 10,
            price: 22000,
            likes: 201,
            image: '✨',
            trending: true
        },
        {
            id: 6,
            name: 'Silver Charm',
            metal: 'Silver',
            gemstone: 'Diamond',
            gemstoneSize: 0.8,
            size: 10,
            price: 28000,
            likes: 178,
            image: '🌟',
            trending: false
        }
    ];

    const styles = {
        container: {
            marginTop: '40px',
            padding: '30px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '16px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        title: {
            fontSize: '2rem',
            marginBottom: '10px',
            color: '#333'
        },
        subtitle: {
            color: '#666',
            fontSize: '1.1rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        badge: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ff6b6b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
        },
        icon: {
            fontSize: '4rem',
            textAlign: 'center',
            marginBottom: '15px'
        },
        designName: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333'
        },
        details: {
            color: '#666',
            fontSize: '0.9rem',
            marginBottom: '12px'
        },
        price: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#28a745',
            marginBottom: '10px'
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #eee'
        },
        likes: {
            color: '#666',
            fontSize: '0.85rem'
        },
        remixBtn: {
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.3s'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🔥 Trending Designs</h2>
                <p style={styles.subtitle}>Get inspired by popular designs from our community</p>
            </div>

            <div style={styles.grid}>
                {TRENDING_DESIGNS.map(design => (
                    <div
                        key={design.id}
                        style={styles.card}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                    >
                        {design.trending && (
                            <div style={styles.badge}>🔥 TRENDING</div>
                        )}

                        <div style={styles.icon}>{design.image}</div>
                        <h3 style={styles.designName}>{design.name}</h3>
                        <p style={styles.details}>
                            {design.metal} • {design.gemstone}
                            {design.gemstoneSize > 0 && ` (${design.gemstoneSize}ct)`}
                        </p>
                        <div style={styles.price}>₹{design.price.toLocaleString('en-IN')}</div>

                        <div style={styles.footer}>
                            <span style={styles.likes}>❤️ {design.likes} likes</span>
                            <button
                                style={styles.remixBtn}
                                onClick={() => onSelectDesign(design)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#5568d3';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#667eea';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                Remix This
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DesignGallery;
