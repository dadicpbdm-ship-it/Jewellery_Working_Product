import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChangePassword from '../components/ChangePassword';
import AnalyticsChart from '../components/AnalyticsChart';
import { API_URL } from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tryAtHomeRequests, setTryAtHomeRequests] = useState([]);
    const [deliveryAgents, setDeliveryAgents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [userGrowth, setUserGrowth] = useState(null);
    const [inventoryHealth, setInventoryHealth] = useState(null);

    const [activeTab, setActiveTab] = useState('overview'); // Default to overview
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchContacts();
        fetchOrders();
        fetchAnalytics();
        fetchTryAtHomeRequests();
        fetchDeliveryAgents();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${user.token}` };

            const [statsRes, analyticsRes, topRes, userGrowthRes, inventoryRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/stats`, { headers }),
                fetch(`${API_URL}/api/admin/analytics?period=30`, { headers }),
                fetch(`${API_URL}/api/admin/top-products?limit=5`, { headers }),
                fetch(`${API_URL}/api/admin/user-growth?period=30`, { headers }),
                fetch(`${API_URL}/api/admin/inventory-health`, { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            if (topRes.ok) setTopProducts(await topRes.json());
            if (userGrowthRes.ok) setUserGrowth(await userGrowthRes.json());
            if (inventoryRes.ok) setInventoryHealth(await inventoryRes.json());

        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const data = await response.json();
            // Handle both array (legacy) and paginated object (new) responses
            setProducts(data.products || data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/contacts`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) setContacts(await response.json());
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) setOrders(await response.json());
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchTryAtHomeRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/api/try-at-home`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) setTryAtHomeRequests(await response.json());
        } catch (error) {
            console.error('Error fetching try at home requests:', error);
        }
    };

    const fetchDeliveryAgents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/delivery-agents`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) setDeliveryAgents(await response.json());
        } catch (error) {
            console.error('Error fetching delivery agents:', error);
        }
    };

    const updateContactStatus = async (contactId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/contacts/${contactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchContacts();
                alert('Contact status updated!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateReturnStatus = async (orderId, status) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;

        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/return-exchange-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchOrders();
                alert(`Request marked as ${status}`);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating status');
        }
    };

    const updateTryAtHomeStatus = async (requestId, status, assignedAgent = null) => {
        try {
            const body = { status };
            if (assignedAgent) body.assignedAgent = assignedAgent;

            const response = await fetch(`${API_URL}/api/try-at-home/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchTryAtHomeRequests();
                alert('Request updated successfully');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update request');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating request');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct
                ? `${API_URL}/api/products/${editingProduct._id}`
                : `${API_URL}/api/products`;
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchProducts();
                resetForm();
                alert(editingProduct ? 'Product updated!' : 'Product added!');
            } else {
                const error = await response.json();
                alert(error.message || 'Error saving product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            imageUrl: product.imageUrl
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                fetchProducts();
                alert('Product deleted!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', category: '', description: '', imageUrl: '' });
        setEditingProduct(null);
        setShowForm(false);
    };

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header-top">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {user.name}!</p>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products ({products.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders ({orders.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
                        onClick={() => setActiveTab('returns')}
                    >
                        Returns ({orders.filter(o => o.returnExchangeRequest && o.returnExchangeRequest.type !== 'None').length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
                        onClick={() => window.location.href = '/admin/delivery-agents'}
                    >
                        Delivery Agents
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'tryathome' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tryathome')}
                    >
                        Try At Home ({tryAtHomeRequests.filter(r => r.status === 'Requested').length})
                    </button>
                    <button
                        className="tab-btn"
                        onClick={() => window.location.href = '/admin/pincodes'}
                    >
                        Manage Pincodes
                    </button>
                    <button
                        className="tab-btn"
                        onClick={() => window.location.href = '/admin/warehouses'}
                    >
                        Manage Warehouses
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contacts')}
                    >
                        Contacts ({contacts.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && analytics && (
                    <div className="overview-section">
                        {/* Quick Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-content">
                                    <h3>Total Products</h3>
                                    <p className="stat-value">{stats.totalProducts}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <h3>Total Users</h3>
                                    <p className="stat-value">{stats.totalUsers}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🛍️</div>
                                <div className="stat-content">
                                    <h3>Total Orders</h3>
                                    <p className="stat-value">{stats.totalOrders}</p>
                                </div>
                            </div>
                            <div className="stat-card alert">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-content">
                                    <h3>Low Stock</h3>
                                    <p className="stat-value">{stats.lowStockProducts}</p>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Cards */}
                        <div className="analytics-section">
                            <h2>Sales Performance (Last 30 Days)</h2>
                            <div className="analytics-cards">
                                <div className="analytics-card">
                                    <h3>Total Revenue</h3>
                                    <p className="revenue-value">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="analytics-card">
                                    <h3>Avg. Order Value</h3>
                                    <p className="revenue-value">₹{Math.round(analytics.averageOrderValue).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="analytics-card">
                                    <h3>Delivered</h3>
                                    <p className="revenue-value">{analytics.deliveredOrders}</p>
                                </div>
                                <div className="analytics-card">
                                    <h3>Pending</h3>
                                    <p className="revenue-value">{analytics.pendingOrders}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Products & Recent Orders */}
                        <div className="dashboard-grid">
                            <div className="top-products-section">
                                <h2>🏆 Top Selling Products</h2>
                                {topProducts.length === 0 ? (
                                    <p className="empty-message">No sales data yet</p>
                                ) : (
                                    <div className="products-list">
                                        {topProducts.map((item, idx) => (
                                            <div key={idx} className="product-item">
                                                <div className="product-rank">#{idx + 1}</div>
                                                <div className="product-info">
                                                    <h4>{item.product?.name || 'Unknown Product'}</h4>
                                                    <p>{item.quantity} sold • ₹{item.revenue.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="recent-orders-section">
                                <h2>📋 Recent Orders</h2>
                                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                    <div className="orders-list">
                                        {stats.recentOrders.map(order => (
                                            <div key={order._id} className="order-item">
                                                <div className="order-info">
                                                    <span className="order-id">#{order._id.substring(0, 8).toUpperCase()}</span>
                                                    <span className="customer-name">
                                                        {order.user?.name || order.guestInfo?.name || 'Guest'}
                                                    </span>
                                                </div>
                                                <div className="order-details">
                                                    <span className="order-amount">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                                    <span className={`order-status ${order.isDelivered ? 'delivered' : 'pending'}`}>
                                                        {order.isDelivered ? 'Delivered' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-message">No recent orders</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && analytics && userGrowth && inventoryHealth && (
                    <div className="analytics-tab">
                        <h2>📊 Business Analytics</h2>

                        {/* Sales Revenue Chart */}
                        {analytics.revenueByDay && (
                            <AnalyticsChart
                                type="line"
                                data={Object.entries(analytics.revenueByDay).map(([date, revenue]) => ({
                                    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    revenue: revenue
                                }))}
                                title="Revenue Trend (Last 30 Days)"
                                dataKey="revenue"
                                xKey="name"
                            />
                        )}

                        {/* User Growth Chart */}
                        {userGrowth.usersByDay && (
                            <AnalyticsChart
                                type="bar"
                                data={Object.entries(userGrowth.usersByDay).map(([date, count]) => ({
                                    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    users: count
                                }))}
                                title="New User Registrations (Last 30 Days)"
                                dataKey="users"
                                xKey="name"
                            />
                        )}

                        {/* Top Products Chart */}
                        {topProducts && topProducts.length > 0 && (
                            <AnalyticsChart
                                type="bar"
                                data={topProducts.map(item => ({
                                    name: item.product.name.substring(0, 20) + '...',
                                    quantity: item.quantity
                                }))}
                                title="Top 5 Selling Products"
                                dataKey="quantity"
                                xKey="name"
                            />
                        )}

                        {/* Inventory Health Section */}
                        <div className="inventory-health-section" style={{ marginTop: '30px' }}>
                            <h3>📦 Inventory Health</h3>
                            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                                <div className="stat-card">
                                    <div className="stat-content">
                                        <h4>Total Products</h4>
                                        <p className="stat-value">{inventoryHealth.summary.total}</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: '#d4edda' }}>
                                    <div className="stat-content">
                                        <h4>Healthy Stock</h4>
                                        <p className="stat-value">{inventoryHealth.summary.healthy}</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: '#fff3cd' }}>
                                    <div className="stat-content">
                                        <h4>Low Stock</h4>
                                        <p className="stat-value">{inventoryHealth.summary.lowStock}</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: '#f8d7da' }}>
                                    <div className="stat-content">
                                        <h4>Out of Stock</h4>
                                        <p className="stat-value">{inventoryHealth.summary.outOfStock}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Low Stock Alerts */}
                            {inventoryHealth.lowStockProducts.length > 0 && (
                                <div className="alert-section">
                                    <h4 style={{ color: '#856404' }}>⚠️ Low Stock Alerts</h4>
                                    <div className="products-list">
                                        {inventoryHealth.lowStockProducts.map(product => (
                                            <div key={product._id} className="product-alert-item" style={{
                                                padding: '10px',
                                                background: '#fff3cd',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span>{product.name}</span>
                                                <span style={{ fontWeight: 'bold' }}>Stock: {product.countInStock}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Out of Stock Alerts */}
                            {inventoryHealth.outOfStockProducts.length > 0 && (
                                <div className="alert-section" style={{ marginTop: '20px' }}>
                                    <h4 style={{ color: '#721c24' }}>🚫 Out of Stock</h4>
                                    <div className="products-list">
                                        {inventoryHealth.outOfStockProducts.map(product => (
                                            <div key={product._id} className="product-alert-item" style={{
                                                padding: '10px',
                                                background: '#f8d7da',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span>{product.name}</span>
                                                <span style={{ fontWeight: 'bold', color: '#721c24' }}>OUT OF STOCK</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <>
                        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : 'Add New Product'}
                        </button>

                        {showForm && (
                            <form className="product-form" onSubmit={handleSubmit}>
                                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} required />
                                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
                                <select name="category" value={formData.category} onChange={handleInputChange} required>
                                    <option value="">Select Category</option>
                                    <option value="Necklaces">Necklaces</option>
                                    <option value="Earrings">Earrings</option>
                                    <option value="Rings">Rings</option>
                                    <option value="Bangles">Bangles</option>
                                    <option value="Bracelets">Bracelets</option>
                                </select>
                                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required />
                                <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleInputChange} required />
                                <div className="form-buttons">
                                    <button type="submit" className="btn-primary">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                                    <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="products-table">
                            <h2>All Products ({products.length})</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <td><img src={product.imageUrl} alt={product.name} className="product-thumb" /></td>
                                            <td>{product.name}</td>
                                            <td>₹{product.price.toLocaleString()}</td>
                                            <td>{product.category}</td>
                                            <td>
                                                <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(product._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <div className="orders-table">
                            <h2>All Orders</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>User</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Paid</th>
                                        <th>Delivered</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td>{order._id}</td>
                                            <td>{order.user?.name || order.guestInfo?.name || 'Guest'}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>₹{order.totalPrice.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`status-badge ${order.isPaid ? 'status-resolved' : 'status-new'}`}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${order.isDelivered ? 'status-resolved' : 'status-in-progress'}`}>
                                                    {order.isDelivered ? 'Delivered' : 'Processing'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-secondary btn-sm" onClick={() => window.location.href = `/order/${order._id}`}>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Returns/Exchanges Tab */}
                {activeTab === 'returns' && (
                    <div className="orders-section">
                        <div className="orders-table">
                            <h2>Return & Exchange Requests</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>User</th>
                                        <th>Type</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders
                                        .filter(order => order.returnExchangeRequest && order.returnExchangeRequest.type !== 'None')
                                        .sort((a, b) => new Date(b.returnExchangeRequest.requestDate) - new Date(a.returnExchangeRequest.requestDate))
                                        .map(order => (
                                            <tr key={order._id}>
                                                <td>{order._id}</td>
                                                <td>{order.user?.name || order.guestInfo?.name || 'Guest'}</td>
                                                <td>
                                                    <span className={`status-badge ${order.returnExchangeRequest.type === 'Return' ? 'status-new' : 'status-in-progress'}`}>
                                                        {order.returnExchangeRequest.type}
                                                    </span>
                                                </td>
                                                <td className="message-cell"><div className="message-preview">{order.returnExchangeRequest.reason}</div></td>
                                                <td>
                                                    <span className={`status-badge status-${order.returnExchangeRequest.status.toLowerCase()}`}>
                                                        {order.returnExchangeRequest.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.returnExchangeRequest.requestDate).toLocaleDateString()}</td>
                                                <td>
                                                    {order.returnExchangeRequest.status === 'Pending' && (
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-edit"
                                                                onClick={() => updateReturnStatus(order._id, 'Approved')}
                                                                style={{ backgroundColor: '#28a745', marginRight: '5px' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => updateReturnStatus(order._id, 'Rejected')}
                                                                style={{ backgroundColor: '#dc3545' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {order.returnExchangeRequest.status === 'Approved' && (
                                                        <button
                                                            className="btn-secondary btn-sm"
                                                            onClick={() => updateReturnStatus(order._id, 'Completed')}
                                                        >
                                                            Mark Completed
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    {orders.filter(order => order.returnExchangeRequest && order.returnExchangeRequest.type !== 'None').length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No return or exchange requests found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Try At Home Tab */}
                {activeTab === 'tryathome' && (
                    <div className="orders-section">
                        <div className="orders-table">
                            <h2>Try At Home Requests</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User</th>
                                        <th>Items</th>
                                        <th>Slot</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Assign Agent</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tryAtHomeRequests.map(req => (
                                        <tr key={req._id}>
                                            <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {req.user.name}<br />
                                                <small>{req.user.phone}</small>
                                            </td>
                                            <td>
                                                <div className="product-thumbnails">
                                                    {req.products.map(p => (
                                                        <img key={p._id} src={p.image} alt={p.name} title={p.name} className="product-thumb-sm" style={{ width: '30px', height: '30px', borderRadius: '4px', marginRight: '5px' }} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                {new Date(req.scheduledDate).toLocaleDateString()}<br />
                                                <small>{req.scheduledTimeSlot}</small>
                                            </td>
                                            <td>{req.address.city}, {req.address.postalCode}</td>
                                            <td>
                                                <span className={`status-badge status-${req.status.toLowerCase()}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td>
                                                {req.status === 'Requested' || req.status === 'Approved' ? (
                                                    <select
                                                        value={req.assignedAgent?._id || ''}
                                                        onChange={(e) => updateTryAtHomeStatus(req._id, 'Approved', e.target.value)}
                                                        className="agent-select"
                                                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                    >
                                                        <option value="">Select Agent</option>
                                                        {deliveryAgents.map(agent => (
                                                            <option key={agent._id} value={agent._id}>{agent.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    req.assignedAgent?.name || '-'
                                                )}
                                            </td>
                                            <td>
                                                {req.status === 'Requested' && (
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => updateTryAtHomeStatus(req._id, 'Rejected')}
                                                        style={{ backgroundColor: '#dc3545', padding: '5px 10px', fontSize: '0.8rem' }}
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                {req.status === 'Approved' && (
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => updateTryAtHomeStatus(req._id, 'Completed')}
                                                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {tryAtHomeRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No requests found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div className="contacts-table">
                        <div className="contacts-header">
                            <h2>Contact Submissions ({contacts.length})</h2>
                            <div className="contacts-controls">
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="control-select">
                                    <option value="all">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="control-select">
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {contacts.length === 0 ? (
                            <p className="no-data">No contact submissions yet.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Subject</th>
                                        <th>Message</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts
                                        .filter(contact => filterStatus === 'all' || contact.status === filterStatus)
                                        .sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt))
                                        .map(contact => (
                                            <tr key={contact._id} className={`status-${contact.status}`}>
                                                <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                                                <td>{contact.name}</td>
                                                <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                                                <td>{contact.subject}</td>
                                                <td className="message-cell"><div className="message-preview">{contact.message}</div></td>
                                                <td><span className={`status-badge status-${contact.status}`}>{contact.status}</span></td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <select value={contact.status} onChange={(e) => updateContactStatus(contact._id, e.target.value)} className="status-select">
                                                            <option value="new">New</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                        <a href={`mailto:${contact.email}?subject=Re: ${contact.subject}`} className="btn-reply" target="_blank" rel="noopener noreferrer">Reply</a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h2>Settings</h2>
                        <ChangePassword />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
