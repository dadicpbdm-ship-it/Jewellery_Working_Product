import React from 'react';
import { Link } from 'react-router-dom';
import './RelatedProducts.css';

const RelatedProducts = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="related-products-section">
            <h3 className="section-title">You May Also Like</h3>
            <div className="related-products-grid">
                {products.map(product => (
                    <Link to={`/product/${product._id}`} key={product._id} className="related-product-card">
                        <div className="related-product-image">
                            <img src={product.imageUrl} alt={product.name} />
                        </div>
                        <div className="related-product-info">
                            <h4>{product.name}</h4>
                            <p className="related-product-price">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
