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
    const [filterStatus, setFilterStatus] = useState('all');
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
    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'pending') return !order.isDelivered;
        if (filterStatus === 'delivered') return order.isDelivered && (!order.returnExchangeRequest || order.returnExchangeRequest.status !== 'Approved');
        if (filterStatus === 'returns') return order.returnExchangeRequest && order.returnExchangeRequest.status === 'Approved';
        return true;
    });

    const totalAssigned = orders.length;
    const deliveredOrders = orders.filter(o => o.isDelivered).length;
    const pendingDelivery = totalAssigned - deliveredOrders;
    const codOrders = orders.filter(o => o.paymentMethod === 'Cash on Delivery').length;
    const codReceived = orders.filter(o => o.codPaymentReceived).length;
    const pendingReturns = orders.filter(o => o.returnExchangeRequest && o.returnExchangeRequest.status === 'Approved').length;

    return (
        <div className="delivery-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>🚚 Delivery Dashboard</h1>
                    <p className="welcome-text">Welcome back, {user.name}! Here are your assigned deliveries.</p>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Assigned</h3>
                        <p className="stat-value">{totalAssigned}</p>
                        <p className="stat-label">Orders</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending Delivery</h3>
                        <p className="stat-value">{pendingDelivery}</p>
                        <p className="stat-label">Orders</p>
                    </div>
                    <div className="stat-card">
                        <h3>Delivered</h3>
                        <p className="stat-value">{deliveredOrders}</p>
                        <p className="stat-label">Orders</p>
                    </div>
                    <div className="stat-card">
                        <h3>COD Orders</h3>
                        <p className="stat-value">{codOrders}</p>
                        <p className="stat-label">Total</p>
                    </div>
                    <div className="stat-card">
                        <h3>COD Collected</h3>
                        <p className="stat-value">{codReceived}</p>
                        <p className="stat-label">Payments</p>
                    </div>
                    <div className="stat-card">
                        <h3>Returns</h3>
                        <p className="stat-value">{pendingReturns}</p>
                        <p className="stat-label">Pending Pickup</p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="filter-section">
                    <h3>Filter Orders</h3>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            All Orders ({orders.length})
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('pending')}
                        >
                            Pending ({pendingDelivery})
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('delivered')}
                        >
                            Delivered ({deliveredOrders})
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'returns' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('returns')}
                        >
                            Returns ({pendingReturns})
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'tryathome' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('tryathome')}
                        >
                            Try At Home ({tryAtHomeTasks.filter(t => t.status === 'Approved').length})
                        </button>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="orders-section">
                    <h2>Delivery Orders</h2>

                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h3>No orders found</h3>
                            <p>There are no orders matching your filter criteria.</p>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {filteredOrders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-id-section">
                                            <span className="order-id">#{order._id.substring(0, 8).toUpperCase()}</span>
                                            <span className="order-customer">{order.user && order.user.name}</span>
                                        </div>
                                        <span className={`order-status ${order.returnExchangeRequest?.status === 'Approved' ? 'pending' : (order.isDelivered ? 'delivered' : 'pending')}`}>
                                            {order.returnExchangeRequest?.status === 'Approved' ? '🔄 Pickup Pending' : (order.isDelivered ? '✓ Delivered' : '⏳ Pending')}
                                        </span>
                                    </div>

                                    <div className="order-body">
                                        <div className="order-row">
                                            <div className="order-info-group">
                                                <span className="info-icon">📍</span>
                                                <div className="info-content">
                                                    <span className="info-label">Delivery Address</span>
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
                                                    <span className="info-label">Order Amount</span>
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
                                            {order.paymentMethod === 'Cash on Delivery' && (
                                                <div className="order-info-group">
                                                    <span className="info-icon">💵</span>
                                                    <div className="info-content">
                                                        <span className="info-label">COD Status</span>
                                                        <span className={`cod-badge ${order.codPaymentReceived ? 'received' : 'pending'}`}>
                                                            {order.codPaymentReceived ? 'Collected' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                                                    title={order.paymentMethod === 'Cash on Delivery' && !order.codPaymentReceived ? "Collect COD payment first" : ""}
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
                                            {order.returnExchangeRequest &&
                                                order.returnExchangeRequest.type &&
                                                order.returnExchangeRequest.type !== 'None' &&
                                                order.returnExchangeRequest.status &&
                                                order.returnExchangeRequest.status.trim() === 'Approved' && (
                                                    <button
                                                        className="btn-action btn-primary"
                                                        style={{ backgroundColor: '#e74c3c' }}
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

                {/* Try At Home Section */}
                {filterStatus === 'tryathome' && (
                    <div className="orders-section">
                        <h2>Try At Home Tasks</h2>
                        {tryAtHomeTasks.length === 0 ? (
                            <div className="empty-state">
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
                                                        <span className="info-label">Scheduled For</span>
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

                {/* Settings Section */}
                {/* Settings Section */}
                <div className="settings-section">
                    <h2>⚙️ Settings</h2>
                    <ChangePassword />
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
