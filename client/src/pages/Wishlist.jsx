import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
    const { addToCart } = useCart();

    const handleMoveToCart = (product) => {
        addToCart(product);
        removeFromWishlist(product._id);
    };

    if (wishlist.length === 0) {
        return (
            <div className="container wishlist-empty">
                <div className="empty-state-content">
                    <div className="empty-icon">💝</div>
                    <h2>Your Wishlist is Empty</h2>
                    <p>Save items you love for later!</p>
                    <p className="empty-subtitle">Click the heart icon on any product to add it here.</p>
                    <div className="empty-actions">
                        <Link to="/shop" className="btn-primary">Explore Products</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page container">
            <div className="wishlist-header">
                <h2>My Wishlist ({wishlist.length})</h2>
                <button onClick={clearWishlist} className="btn-clear-wishlist">
                    Clear All
                </button>
            </div>
            <div className="wishlist-grid">
                {wishlist.map(product => (
                    <div key={product._id} className="wishlist-card">
                        <Link to={`/product/${product._id}`} className="wishlist-image-link">
                            <img src={product.imageUrl || product.image} alt={product.name} />
                        </Link>
                        <div className="wishlist-details">
                            <Link to={`/product/${product._id}`}>
                                <h3>{product.name}</h3>
                            </Link>
                            <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
                            <div className="wishlist-actions">
                                <button
                                    onClick={() => handleMoveToCart(product)}
                                    className="btn-move-cart"
                                >
                                    Move to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="btn-remove"
                                    title="Remove from Wishlist"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
