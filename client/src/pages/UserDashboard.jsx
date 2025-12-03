import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChangePassword from '../components/ChangePassword';
import { API_URL } from '../config';
import OrderTracking from '../components/OrderTracking';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const { success, error } = useToast();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [tryAtHomeRequests, setTryAtHomeRequests] = useState([]);
    const [alerts, setAlerts] = useState([]);
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

                // Fetch loyalty data for summary
                try {
                    const loyaltyRes = await fetch(`${API_URL}/api/loyalty/dashboard`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (loyaltyRes.ok) {
                        const loyaltyData = await loyaltyRes.json();
                        setStats(prev => ({ ...prev, loyalty: loyaltyData }));
                    }
                } catch (err) {
                    console.error('Error fetching loyalty summary:', err);
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

            // Fetch Try At Home Requests
            try {
                const tryRes = await fetch(`${API_URL}/api/try-at-home`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (tryRes.ok) {
                    const tryData = await tryRes.json();
                    setTryAtHomeRequests(tryData);
                }
            } catch (err) {
                console.error('Error fetching try at home requests:', err);
            }

            // Fetch Alerts
            try {
                const alertsRes = await fetch(`${API_URL}/api/alerts/my-alerts`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (alertsRes.ok) {
                    const alertsData = await alertsRes.json();
                    setAlerts(alertsData);
                }
            } catch (err) {
                console.error('Error fetching alerts:', err);
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

    const deleteAlert = async (alertId) => {
        if (!window.confirm('Remove this alert?')) return;
        try {
            const response = await fetch(`${API_URL}/api/alerts/${alertId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                setAlerts(alerts.filter(a => a._id !== alertId));
                success('Alert removed');
            }
        } catch (err) {
            console.error('Error removing alert:', err);
            error('Error removing alert');
        }
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

                {/* Loyalty Summary */}
                {stats && stats.loyalty && (
                    <div className="loyalty-summary-card" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #dee2e6'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>My Rewards</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700' }}>
                                    🪙 {stats.loyalty.points} Points
                                </span>
                                <span style={{
                                    background: '#333',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {stats.loyalty.tier} Member
                                </span>
                            </div>
                        </div>
                        <Link to="/rewards" className="btn-primary" style={{ textDecoration: 'none' }}>
                            View Rewards
                        </Link>
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
                        className={`tab-btn ${activeTab === 'tryathome' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tryathome')}
                    >
                        Try At Home
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('alerts')}
                    >
                        My Alerts
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
                                            <div className="order-timeline-wrapper">
                                                <OrderTracking order={order} />
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

                    {activeTab === 'tryathome' && (
                        <div className="try-at-home-section">
                            <h2>My Try at Home Requests</h2>
                            {tryAtHomeRequests.length === 0 ? (
                                <div className="empty-state">
                                    <p>No requests found.</p>
                                    <Link to="/shop" className="btn-primary" style={{ marginTop: '10px' }}>Browse Products</Link>
                                </div>
                            ) : (
                                <div className="requests-list">
                                    {tryAtHomeRequests.map(req => (
                                        <div key={req._id} className="order-card">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">#{req._id.substring(0, 8).toUpperCase()}</span>
                                                    <span className="order-date">
                                                        {new Date(req.scheduledDate).toLocaleDateString()} ({req.scheduledTimeSlot})
                                                    </span>
                                                </div>
                                                <span className={`order-status ${req.status.toLowerCase()}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div className="order-items" style={{ padding: '15px' }}>
                                                {req.products.map(prod => (
                                                    <div key={prod._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                        <img src={prod.image} alt={prod.name} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                                                        <div>
                                                            <p style={{ margin: 0, fontWeight: '600' }}>{prod.name}</p>
                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>₹{prod.price.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {req.assignedAgent && (
                                                <div className="agent-info" style={{ padding: '10px 15px', background: '#f8f9fa', borderTop: '1px solid #eee' }}>
                                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                                        <strong>Agent:</strong> {req.assignedAgent.name} ({req.assignedAgent.phone})
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="alerts-section">
                            <h2>My Alerts</h2>
                            {alerts.length === 0 ? (
                                <div className="empty-state">
                                    <p>No active alerts.</p>
                                    <Link to="/shop" className="btn-primary" style={{ marginTop: '10px' }}>Browse Products</Link>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {alerts.map(alert => (
                                        <div key={alert._id} className="order-card">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">{alert.type === 'price' ? '🔔 Price Alert' : '📦 Stock Alert'}</span>
                                                    <span className="order-date">{new Date(alert.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`order-status ${alert.status === 'triggered' ? 'delivered' : 'pending'}`}>
                                                    {alert.status}
                                                </span>
                                            </div>
                                            <div className="order-items" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <img src={alert.product.imageUrl} alt={alert.product.name} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    <div>
                                                        <Link to={`/product/${alert.product._id}`} style={{ fontWeight: '600', color: '#333', textDecoration: 'none' }}>
                                                            {alert.product.name}
                                                        </Link>
                                                        {alert.type === 'price' && (
                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                                                Target: ₹{alert.targetPrice.toLocaleString('en-IN')} (Current: ₹{alert.product.price.toLocaleString('en-IN')})
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteAlert(alert._id)}
                                                    title="Remove Alert"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
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
