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
            background: '#C9A961',
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
        <div className="gallery-container">
            <div className="gallery-header">
                <h2 className="gallery-title">🔥 Trending Designs</h2>
                <p className="gallery-subtitle">Get inspired by popular designs from our community</p>
            </div>

            <div className="gallery-grid">
                {TRENDING_DESIGNS.map(design => (
                    <div key={design.id} className="gallery-card">
                        {design.trending && (
                            <div className="gallery-badge">🔥 TRENDING</div>
                        )}

                        <div className="gallery-icon">{design.image}</div>
                        <h3 className="gallery-design-name">{design.name}</h3>
                        <p className="gallery-details">
                            {design.metal} • {design.gemstone}
                            {design.gemstoneSize > 0 && ` (${design.gemstoneSize}ct)`}
                        </p>
                        <div className="gallery-price">₹{design.price.toLocaleString('en-IN')}</div>

                        <div className="gallery-footer">
                            <span className="gallery-likes">❤️ {design.likes} likes</span>
                            <button
                                className="gallery-remix-btn"
                                onClick={() => onSelectDesign(design)}
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
