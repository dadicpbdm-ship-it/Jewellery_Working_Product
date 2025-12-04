import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { API_URL } from '../config';
import './ProductRecommendations.css';

const ProductRecommendations = ({ productId, type = 'similar', title }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [productId, type]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            let endpoint = '';

            switch (type) {
                case 'similar':
                    endpoint = `${API_URL}/api/recommendations/similar/${productId}`;
                    break;
                case 'complete-the-look':
                    endpoint = `${API_URL}/api/recommendations/complete-the-look/${productId}`;
                    break;
                case 'trending':
                    endpoint = `${API_URL}/api/recommendations/trending`;
                    break;
                default:
                    endpoint = `${API_URL}/api/recommendations/similar/${productId}`;
            }

            const response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="recommendations-section">
                <h2>{title || 'Loading...'}</h2>
                <div className="loading-spinner">Loading recommendations...</div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="recommendations-section">
            <h2>{title || 'You May Also Like'}</h2>
            <div className="recommendations-grid">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
