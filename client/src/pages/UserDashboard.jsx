import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChangePassword from '../components/ChangePassword';
import { API_URL } from '../config';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const { success, error } = useToast();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch user statistics
            try {
                const statsRes = await fetch(`${API_URL}/api/users/stats`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }

            // Fetch recent orders
            try {
                const ordersRes = await fetch(`${API_URL}/api/orders/myorders`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData.slice(0, 5));
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
            }

            // Fetch addresses
            fetchAddresses();

        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const addressRes = await fetch(`${API_URL}/api/users/addresses`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (addressRes.ok) {
                const addressData = await addressRes.json();
                setAddresses(addressData);
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    const openAddressModal = (addr = null) => {
        if (addr) {
            setEditingAddress(addr);
            setAddressForm({
                name: addr.name || '',
                address: addr.address || '',
                city: addr.city || '',
                postalCode: addr.postalCode || '',
                country: addr.country || ''
            });
        } else {
            setEditingAddress(null);
            setAddressForm({
                name: '',
                address: '',
                city: '',
                postalCode: '',
                country: ''
            });
        }
        setShowAddressModal(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const url = editingAddress
                ? `${API_URL}/api/users/addresses/${editingAddress._id}`
                : `${API_URL}/api/users/addresses`;

            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(addressForm)
            });

            if (response.ok) {
                success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
                setShowAddressModal(false);
                fetchAddresses(); // Refresh list
            } else {
                const data = await response.json();
                error(data.message || 'Failed to save address');
            }
        } catch (err) {
            console.error('Error saving address:', err);
            error('Error saving address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await fetch(`${API_URL}/api/users/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                success('Address deleted successfully');
                fetchAddresses(); // Refresh list
            } else {
                error('Failed to delete address');
            }
        } catch (err) {
            console.error('Error deleting address:', err);
            error('Error deleting address');
        }
    };

    const getStatusTimeline = (order) => {
        const steps = [
            { label: 'Placed', completed: true, date: order.createdAt },
            { label: 'Processing', completed: true, date: order.createdAt },
            { label: 'Shipped', completed: order.isDelivered, date: order.deliveredAt },
            { label: 'Delivered', completed: order.isDelivered, date: order.deliveredAt }
        ];
        return steps;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user.name}!</h1>
                        <p>Manage your orders, addresses, and profile</p>
                    </div>
                    <button onClick={() => setShowPasswordModal(true)} className="btn-change-password">
                        🔒 Change Password
                    </button>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📦</div>
                            <div className="stat-content">
                                <h3>Total Orders</h3>
                                <p className="stat-value">{stats.totalOrders}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <h3>Total Spent</h3>
                                <p className="stat-value">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <h3>Delivered</h3>
                                <p className="stat-value">{stats.deliveredOrders}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3>Pending</h3>
                                <p className="stat-value">{stats.pendingOrders}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Recent Orders
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('addresses')}
                    >
                        Saved Addresses
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Settings
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="orders-section">
                            <h2>Recent Orders</h2>
                            {orders.length === 0 ? (
                                <div className="empty-state">
                                    <p>No orders yet</p>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map(order => (
                                        <div key={order._id} className="order-card">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">#{order._id.substring(0, 8).toUpperCase()}</span>
                                                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`order-status ${order.isDelivered ? 'delivered' : 'pending'}`}>
                                                    {order.isDelivered ? 'Delivered' : 'Processing'}
                                                </span>
                                            </div>
                                            <div className="order-timeline">
                                                {getStatusTimeline(order).map((step, idx) => (
                                                    <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                                                        <div className="step-marker"></div>
                                                        <div className="step-label">{step.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="order-footer">
                                                <span className="order-total">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                                <Link to={`/order/${order._id}`} className="btn-view-order">View Details</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="addresses-section">
                            <div className="section-header">
                                <h2>Saved Addresses</h2>
                                <button className="btn-add-address" onClick={() => openAddressModal()}>
                                    + Add New Address
                                </button>
                            </div>
                            {addresses.length === 0 ? (
                                <div className="empty-state">
                                    <p>No saved addresses</p>
                                </div>
                            ) : (
                                <div className="addresses-grid">
                                    {addresses.map((addr, idx) => (
                                        <div key={idx} className="address-card">
                                            <div className="address-actions">
                                                <button className="btn-icon edit" onClick={() => openAddressModal(addr)} title="Edit">✎</button>
                                                <button className="btn-icon delete" onClick={() => handleDeleteAddress(addr._id)} title="Delete">🗑️</button>
                                            </div>
                                            <h4>{addr.name || 'Home'}</h4>
                                            <p>{addr.address}</p>
                                            <p>{addr.city}, {addr.postalCode}</p>
                                            <p>{addr.country}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <h2>Profile Settings</h2>
                            <div className="profile-info">
                                <div className="info-item">
                                    <label>Name</label>
                                    <p>{user.name}</p>
                                </div>
                                <div className="info-item">
                                    <label>Email</label>
                                    <p>{user.email}</p>
                                </div>
                                <div className="info-item">
                                    <label>Account Type</label>
                                    <p className="role-badge">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Change Password</h2>
                                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
                            </div>
                            <ChangePassword onSuccess={() => setShowPasswordModal(false)} />
                        </div>
                    </div>
                )}

                {/* Address Modal */}
                {showAddressModal && (
                    <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                                <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveAddress} className="address-form">
                                <div className="form-group">
                                    <label>Name (e.g., Home, Office)</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={addressForm.name}
                                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                        placeholder="Home"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={addressForm.address}
                                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                        required
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            required
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={addressForm.postalCode}
                                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                            required
                                            placeholder="Postal Code"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        required
                                        placeholder="Country"
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
