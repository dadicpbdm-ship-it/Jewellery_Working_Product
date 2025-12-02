import React from 'react';
import { Link } from 'react-router-dom';
import './Checkout.css'; // Reuse checkout styles

const OrderSuccess = () => {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2 className="section-title">Order Placed Successfully!</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                Thank you for your purchase. We have received your order and will process it shortly.
            </p>
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
    );
};

export default OrderSuccess;
