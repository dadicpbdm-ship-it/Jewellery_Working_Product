import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            try {
                setRecentProducts(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse recently viewed', e);
            }
        }
    }, []);

    if (recentProducts.length === 0) return null;

    return (
        <div className="recently-viewed-section">
            <h3 className="section-title">Recently Viewed</h3>
            <div className="recently-viewed-grid">
                {recentProducts.map(product => (
                    <Link to={`/product/${product._id}`} key={product._id} className="recently-viewed-card">
                        <div className="rv-image">
                            <img src={product.imageUrl} alt={product.name} />
                        </div>
                        <div className="rv-info">
                            <h4>{product.name}</h4>
                            <p>₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
