import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChangePassword from '../components/ChangePassword';
import { API_URL } from '../config';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const { success, error } = useToast();
    const [orders, setOrders] = useState([]);
    const [tryAtHomeTasks, setTryAtHomeTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchTryAtHomeTasks();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/orders/delivery`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Filter to show only orders assigned to this delivery agent
            const assignedOrders = data.filter(order =>
                order.deliveryAgent && order.deliveryAgent.toString() === user._id
            );
            setOrders(assignedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchTryAtHomeTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/try-at-home`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTryAtHomeTasks(data);
            }
        } catch (err) {
            console.error('Error fetching try at home tasks:', err);
        }
    };

    const markAsDelivered = async (orderId) => {
        if (!window.confirm('Are you sure you want to mark this order as delivered?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                fetchOrders();
                success('Order marked as delivered!');
            } else {
                let errorMessage = 'Error updating order';
                try {
                    const errData = await response.json();
                    errorMessage = errData.message || errorMessage;
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                error(`Failed: ${errorMessage}`);
            }
        } catch (err) {
            console.error('Error:', err);
            error(`Network/Client Error: ${err.message}`);
        }
    };

    const markCODReceived = async (orderId) => {
        if (!window.confirm('Confirm that you have received the COD payment?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/cod-payment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                fetchOrders();
                success('COD payment marked as received!');
            } else {
                const errData = await response.json();
                error(errData.message || 'Error updating payment status');
            }
        } catch (err) {
            console.error('Error:', err);
            error('Error updating payment status');
        }
    };

    const completeReturn = async (orderId) => {
        if (!window.confirm('Confirm that you have picked up the return item?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/return-exchange-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: 'Picked Up' })
            });

            if (response.ok) {
                fetchOrders();
                success('Return marked as Picked Up!');
            } else {
                const errData = await response.json();
                error(errData.message || 'Error updating return status');
            }
        } catch (err) {
            console.error('Error:', err);
            error('Error updating return status');
        }
    };

    const completeTryAtHome = async (requestId) => {
        if (!window.confirm('Confirm that the Try at Home session is completed?')) return;

        try {
            const response = await fetch(`${API_URL}/api/try-at-home/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: 'Completed' })
            });

            if (response.ok) {
                fetchTryAtHomeTasks();
                success('Task marked as completed!');
            } else {
                const data = await response.json();
                error(data.message || 'Failed to update task');
            }
        } catch (err) {
            console.error('Error:', err);
            error('Error updating task');
        }
    };

    // Calculate Stats
    const totalAssigned = orders.length;
    const deliveredOrders = orders.filter(o => o.isDelivered).length;
    const pendingDelivery = totalAssigned - deliveredOrders;
    const codOrders = orders.filter(o => o.paymentMethod === 'Cash on Delivery').length;
    const codReceived = orders.filter(o => o.codPaymentReceived).length;
    const pendingReturns = orders.filter(o => o.returnExchangeRequest && o.returnExchangeRequest.status === 'Approved').length;

    // Filter Logic based on Active Tab
    const getFilteredOrders = () => {
        if (activeTab === 'pending') return orders.filter(order => !order.isDelivered);
        if (activeTab === 'delivered') return orders.filter(order => order.isDelivered && (!order.returnExchangeRequest || order.returnExchangeRequest.status !== 'Approved'));
        if (activeTab === 'returns') return orders.filter(order => order.returnExchangeRequest && order.returnExchangeRequest.status === 'Approved');
        return orders; // 'orders' tab shows all
    };

    const displayOrders = getFilteredOrders();

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your tasks...</p>
            </div>
        );
    }

    return (
        <div className="delivery-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Delivery Dashboard</h1>
                        <p>Welcome back, {user.name}! Manage your deliveries and tasks.</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Total Assigned</h3>
                            <p className="stat-value">{totalAssigned}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>Pending</h3>
                            <p className="stat-value">{pendingDelivery}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Delivered</h3>
                            <p className="stat-value">{deliveredOrders}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>COD Collected</h3>
                            <p className="stat-value">{codReceived} / {codOrders}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({pendingDelivery})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
                        onClick={() => setActiveTab('delivered')}
                    >
                        Delivered ({deliveredOrders})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
                        onClick={() => setActiveTab('returns')}
                    >
                        Returns ({pendingReturns})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'tryathome' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tryathome')}
                    >
                        Try At Home ({tryAtHomeTasks.filter(t => t.status === 'Approved').length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Profile & Settings
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab !== 'tryathome' && activeTab !== 'settings' && (
                        <div className="orders-section">
                            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders</h2>

                            {displayOrders.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📭</div>
                                    <h3>No orders found</h3>
                                    <p>No orders in this category.</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {displayOrders.map(order => (
                                        <div key={order._id} className="order-card">
                                            <div className="order-header">
                                                <div className="order-id-section">
                                                    <span className="order-id">#{order._id.substring(0, 8).toUpperCase()}</span>
                                                    <span className="order-customer">{order.user && order.user.name}</span>
                                                </div>
                                                <span className={`order-status ${order.returnExchangeRequest?.status === 'Approved' ? 'pending' : (order.isDelivered ? 'delivered' : 'pending')}`}>
                                                    {order.returnExchangeRequest?.status === 'Approved' ? '🔄 Return' : (order.isDelivered ? '✓ Done' : '⏳ Pending')}
                                                </span>
                                            </div>

                                            <div className="order-body">
                                                <div className="order-row">
                                                    <div className="order-info-group">
                                                        <span className="info-icon">📍</span>
                                                        <div className="info-content">
                                                            <span className="info-label">Address</span>
                                                            <span className="info-text">
                                                                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="order-row">
                                                    <div className="order-info-group">
                                                        <span className="info-icon">💰</span>
                                                        <div className="info-content">
                                                            <span className="info-label">Amount</span>
                                                            <span className="info-value">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="order-info-group">
                                                        <span className="info-icon">💳</span>
                                                        <div className="info-content">
                                                            <span className="info-label">Payment</span>
                                                            <span className={`payment-badge ${order.paymentMethod === 'Cash on Delivery' ? 'cod' : 'online'}`}>
                                                                {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Paid'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {order.paymentMethod === 'Cash on Delivery' && (
                                                    <div className="order-row">
                                                        <div className="order-info-group">
                                                            <span className="info-icon">💵</span>
                                                            <div className="info-content">
                                                                <span className="info-label">COD Status</span>
                                                                <span className={`cod-badge ${order.codPaymentReceived ? 'received' : 'pending'}`}>
                                                                    {order.codPaymentReceived ? 'Collected' : 'Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {(!order.isDelivered || (order.paymentMethod === 'Cash on Delivery' && !order.codPaymentReceived) || (order.returnExchangeRequest && order.returnExchangeRequest.status === 'Approved')) && (
                                                <div className="order-actions">
                                                    {!order.isDelivered && (
                                                        <button
                                                            className={`btn-action btn-primary ${order.paymentMethod === 'Cash on Delivery' && !order.codPaymentReceived ? 'disabled' : ''}`}
                                                            onClick={() => {
                                                                if (order.paymentMethod === 'Cash on Delivery' && !order.codPaymentReceived) {
                                                                    alert('Please confirm COD payment received before marking as delivered.');
                                                                    return;
                                                                }
                                                                markAsDelivered(order._id);
                                                            }}
                                                            style={order.paymentMethod === 'Cash on Delivery' && !order.codPaymentReceived ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                        >
                                                            ✓ Mark as Delivered
                                                        </button>
                                                    )}
                                                    {order.paymentMethod === 'Cash on Delivery' && !order.codPaymentReceived && (
                                                        <button
                                                            className="btn-action btn-secondary"
                                                            onClick={() => markCODReceived(order._id)}
                                                        >
                                                            💰 Confirm COD Received
                                                        </button>
                                                    )}
                                                    {order.returnExchangeRequest?.status === 'Approved' && (
                                                        <button
                                                            className="btn-action btn-primary"
                                                            style={{ backgroundColor: 'var(--error-color)', border: 'none' }}
                                                            onClick={() => completeReturn(order._id)}
                                                        >
                                                            📦 Mark Picked Up
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tryathome' && (
                        <div className="orders-section">
                            <h2>Try At Home Tasks</h2>
                            {tryAtHomeTasks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🏠</div>
                                    <p>No Try at Home tasks assigned.</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {tryAtHomeTasks.map(task => (
                                        <div key={task._id} className="order-card">
                                            <div className="order-header">
                                                <div className="order-id-section">
                                                    <span className="order-id">#{task._id.substring(0, 8).toUpperCase()}</span>
                                                    <span className="order-customer">{task.user.name}</span>
                                                </div>
                                                <span className={`order-status ${task.status.toLowerCase()}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <div className="order-body">
                                                <div className="order-row">
                                                    <div className="order-info-group">
                                                        <span className="info-icon">📍</span>
                                                        <div className="info-content">
                                                            <span className="info-label">Address</span>
                                                            <span className="info-text">
                                                                {task.address.address}, {task.address.city}, {task.address.postalCode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="order-row">
                                                    <div className="order-info-group">
                                                        <span className="info-icon">📅</span>
                                                        <div className="info-content">
                                                            <span className="info-label">Scheduled</span>
                                                            <span className="info-text">
                                                                {new Date(task.scheduledDate).toLocaleDateString()} ({task.scheduledTimeSlot})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="order-info-group">
                                                        <span className="info-icon">📞</span>
                                                        <div className="info-content">
                                                            <span className="info-label">Contact</span>
                                                            <span className="info-text">{task.user.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {task.status === 'Approved' && (
                                                <div className="order-actions">
                                                    <button
                                                        className="btn-action btn-primary"
                                                        onClick={() => completeTryAtHome(task._id)}
                                                    >
                                                        ✓ Mark Completed
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="orders-section">
                            <h2>Profile & Settings</h2>
                            <div className="settings-container" style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="profile-info" style={{ marginBottom: '2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '2rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)', fontSize: '1.2rem' }}>Delivery Agent Profile</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block', fontWeight: '600' }}>Name</label>
                                            <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--secondary-color)' }}>{user.name}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block', fontWeight: '600' }}>Email</label>
                                            <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--secondary-color)' }}>{user.email}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block', fontWeight: '600' }}>Role</label>
                                            <span className="role-badge" style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700' }}>{user.role}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)', fontSize: '1.2rem' }}>Security</h3>
                                    <ChangePassword />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
