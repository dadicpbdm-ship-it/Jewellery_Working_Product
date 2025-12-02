import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const isWishlisted = isInWishlist(product._id);

    const handleWishlistClick = (e) => {
        e.preventDefault(); // Prevent navigation if clicking the heart
        if (isWishlisted) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product._id);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image">
                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlistClick}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    ♥
                </button>
                <img
                    src={product.imageUrl}
                    alt={`${product.name} - ${product.category} jewellery`}
                    loading="lazy"
                    decoding="async"
                />
            </div>
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                {product.rating > 0 && (
                    <div className="product-rating">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                        <span className="rating-count">({product.numReviews || 0})</span>
                    </div>
                )}
                <div className="product-price">₹{product.price.toLocaleString('en-IN')}</div>
                <Link to={`/product/${product._id}`} className="btn-view">View Details</Link>
            </div>
        </div>
    );
};

export default ProductCard;
