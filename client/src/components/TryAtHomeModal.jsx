import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import './TryAtHomeModal.css';

const TryAtHomeModal = ({ product, onClose }) => {
    const { user } = useContext(AuthContext);
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        scheduledDate: '',
        scheduledTimeSlot: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India'
    });

    const timeSlots = [
        '10:00 AM - 12:00 PM',
        '12:00 PM - 02:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM'
    ];

    // Pre-fill address if user has one
    useState(() => {
        if (user && user.addresses && user.addresses.length > 0) {
            const defaultAddr = user.addresses[0];
            setFormData(prev => ({
                ...prev,
                address: defaultAddr.address,
                city: defaultAddr.city,
                postalCode: defaultAddr.postalCode,
                country: defaultAddr.country
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/try-at-home`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    products: [product._id],
                    address: {
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode,
                        country: formData.country
                    },
                    scheduledDate: formData.scheduledDate,
                    scheduledTimeSlot: formData.scheduledTimeSlot
                })
            });

            const data = await response.json();

            if (response.ok) {
                success('Try at Home request submitted successfully!');
                onClose();
            } else {
                error(data.message || 'Failed to submit request');
            }
        } catch (err) {
            console.error('Error submitting request:', err);
            error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content try-at-home-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🏠 Book Try at Home</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-product-summary">
                    <img src={product.image} alt={product.name} />
                    <div>
                        <h4>{product.name}</h4>
                        <p>Try this item at your doorstep before buying.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Select Slot</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.scheduledDate}
                                    onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Time Slot</label>
                                <select
                                    required
                                    value={formData.scheduledTimeSlot}
                                    onChange={e => setFormData({ ...formData, scheduledTimeSlot: e.target.value })}
                                >
                                    <option value="">Select Time</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Address</h3>
                        <div className="form-group">
                            <label>Street Address</label>
                            <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="House No, Street Name"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.postalCode}
                                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TryAtHomeModal;
