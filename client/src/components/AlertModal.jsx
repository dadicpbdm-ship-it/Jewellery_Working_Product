import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import './AlertModal.css';

const AlertModal = ({ product, type, onClose, user }) => {
    const { success, error } = useToast();
    const [targetPrice, setTargetPrice] = useState(type === 'price' ? Math.floor(product.price * 0.9) : '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    type,
                    targetPrice: type === 'price' ? Number(targetPrice) : undefined
                })
            });

            if (response.ok) {
                success(`Alert set! We'll notify you on WhatsApp.`);
                onClose();
            } else {
                const data = await response.json();
                error(data.message || 'Failed to set alert');
            }
        } catch (err) {
            console.error('Error setting alert:', err);
            error('Error setting alert');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {type === 'price' ? 'Set Price Alert' :
                            type === 'availability' ? 'Availability Alert' :
                                'Back in Stock Alert'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="alert-product-info">
                        <img src={product.imageUrl} alt={product.name} />
                        <div>
                            <h4>{product.name}</h4>
                            <p>Current Price: ₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {type === 'price' ? (
                        <div className="form-group">
                            <label>Notify me when price drops below:</label>
                            <input
                                type="number"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                max={product.price - 1}
                                required
                            />
                            <small>We suggest setting a target at least 10% lower.</small>
                        </div>
                    ) : type === 'availability' ? (
                        <p className="stock-alert-text">
                            We will notify you on WhatsApp (<strong>{user.phone}</strong>) when delivery becomes available to your location.
                        </p>
                    ) : (
                        <p className="stock-alert-text">
                            We will send a WhatsApp message to <strong>{user.phone}</strong> as soon as this item is back in stock.
                        </p>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Setting Alert...' : 'Set Alert'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlertModal;
