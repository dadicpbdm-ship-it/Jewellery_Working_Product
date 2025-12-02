import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './ManageDeliveryAgents.css';

const DeliveryAgentRegister = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        assignedArea: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/delivery-agents/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('✅ Delivery agent registered successfully!');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    assignedArea: ''
                });
                setTimeout(() => {
                    navigate('/admin/delivery-agents');
                }, 2000);
            } else {
                setError(data.message || 'Error registering delivery agent');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error registering delivery agent');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manage-agents-page">
            <div className="container">
                <h1>➕ Register Delivery Agent</h1>
                <p className="subtitle">Create a new delivery agent account</p>

                <div className="agents-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                        {error && (
                            <div style={{
                                padding: '15px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                fontWeight: '600'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                padding: '15px',
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                fontWeight: '600'
                            }}>
                                {success}
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="agent@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength="6"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+91 1234567890"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Assigned Area (City) *
                            </label>
                            <input
                                type="text"
                                name="assignedArea"
                                placeholder="e.g., Mumbai, Delhi, Bangalore"
                                value={formData.assignedArea}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                            <small style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                                This agent will be automatically assigned orders from this city
                            </small>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                type="submit"
                                className="btn-register"
                                disabled={loading}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                {loading ? '⏳ Registering...' : '✓ Register Agent'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/delivery-agents')}
                                style={{
                                    flex: 1,
                                    padding: '12px 30px',
                                    background: '#e0e0e0',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeliveryAgentRegister;
