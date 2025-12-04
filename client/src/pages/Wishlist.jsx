import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { API_URL } from '../config';
import './Wishlist.css';

const Wishlist = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const fetchWishlist = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlistItems(data.products || []);
            } else {
                throw new Error('Failed to fetch wishlist');
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
            setError('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
            }
        } catch (err) {
            console.error('Error removing from wishlist:', err);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        // Optional: Remove from wishlist after adding to cart
        // removeFromWishlist(product._id);
        alert('Added to cart!');
    };

    if (loading) return <div className="wishlist-container loading">Loading...</div>;

    if (!user) {
        return (
            <div className="wishlist-container empty">
                <h2>Please login to view your wishlist</h2>
                <Link to="/login" className="btn-primary">Login</Link>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-container empty">
                <h2>Your Wishlist is Empty</h2>
                <p>Save items you love to review them later.</p>
                <Link to="/shop" className="btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <h1>My Wishlist ({wishlistItems.length})</h1>
            <div className="wishlist-grid">
                {wishlistItems.map(({ product, addedAt }) => (
                    product && (
                        <div key={product._id} className="wishlist-item-card">
                            <Link to={`/product/${product._id}`} className="wishlist-item-image">
                                <img src={product.imageUrl || product.image} alt={product.name} />
                            </Link>
                            <div className="wishlist-item-details">
                                <Link to={`/product/${product._id}`}>
                                    <h3>{product.name}</h3>
                                </Link>
                                <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
                                <p className="added-date">Added on {new Date(addedAt).toLocaleDateString()}</p>

                                <div className="wishlist-actions">
                                    <button
                                        className="btn-add-cart"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.countInStock === 0}
                                    >
                                        {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                    <button
                                        className="btn-remove"
                                        onClick={() => removeFromWishlist(product._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
