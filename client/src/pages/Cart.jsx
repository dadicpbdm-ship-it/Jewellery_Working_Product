import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container cart-empty">
                <div className="empty-state-content">
                    <div className="empty-icon">🛒</div>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <p className="empty-subtitle">Discover our exquisite collection of jewellery!</p>
                    <div className="empty-actions">
                        <Link to="/shop" className="btn-primary">Browse Collection</Link>
                        <Link to="/wishlist" className="btn-secondary">View Wishlist</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container cart-page">
            <h2 className="section-title">Your Cart</h2>
            <div className="cart-grid">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item._id} className="cart-item">
                            <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3>{item.name}</h3>
                                <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <div className="cart-item-total">
                                <p>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <Link to="/checkout" className="btn-primary checkout-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Proceed to Checkout</Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
