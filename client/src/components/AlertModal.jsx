import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import './AlertModal.css';

const AlertModal = ({ product, type, onClose, user, pincode }) => {
    const { success, error } = useToast();
    const [targetPrice, setTargetPrice] = useState(type === 'price' ? Math.floor(product.price * 0.9) : '');
    const [channels, setChannels] = useState({ whatsapp: true, email: true });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedChannels = Object.keys(channels).filter(key => channels[key]);

        if (selectedChannels.length === 0) {
            error('Please select at least one notification channel');
            setLoading(false);
            return;
        }

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
                    targetPrice: type === 'price' ? Number(targetPrice) : undefined,
                    pincode: type === 'availability' ? pincode : undefined,
                    channels: selectedChannels
                })
            });

            if (response.ok) {
                success(`Alert set! We'll notify you via ${selectedChannels.join(' & ')}.`);
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
                            {type === 'availability' && pincode && (
                                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                                    Location: <strong>{pincode}</strong>
                                </p>
                            )}
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
                            We will notify you when delivery becomes available to <strong>{pincode}</strong>.
                        </p>
                    ) : (
                        <p className="stock-alert-text">
                            We will notify you as soon as this item is back in stock.
                        </p>
                    )}

                    <div className="channel-selection" style={{ margin: '15px 0', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Notify me via:</label>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={channels.whatsapp}
                                    onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                                />
                                WhatsApp
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={channels.email}
                                    onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                                />
                                Email
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Setting Alert...' : 'Set Alert'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlertModal;
