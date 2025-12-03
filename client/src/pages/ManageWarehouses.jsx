import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import './ManageWarehouses.css';

const ManageWarehouses = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showInventory, setShowInventory] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        location: {
            address: '',
            city: '',
            state: '',
            pincode: ''
        },
        serviceablePincodes: '',
        manager: {
            name: '',
            email: '',
            phone: ''
        },
        isActive: true
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await fetch(`${API_URL}/api/warehouses`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setWarehouses(data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `${API_URL}/api/warehouses/${editingId}`
                : `${API_URL}/api/warehouses`;

            const method = editingId ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                serviceablePincodes: formData.serviceablePincodes
                    .split(',')
                    .map(p => p.trim())
                    .filter(p => p)
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchWarehouses();
                resetForm();
                alert(editingId ? 'Warehouse updated successfully' : 'Warehouse created successfully');
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving warehouse');
            }
        } catch (error) {
            console.error('Error saving warehouse:', error);
            alert('Error saving warehouse');
        }
    };

    const handleEdit = (warehouse) => {
        setFormData({
            name: warehouse.name,
            code: warehouse.code,
            location: warehouse.location,
            serviceablePincodes: warehouse.serviceablePincodes.join(', '),
            manager: warehouse.manager || { name: '', email: '', phone: '' },
            isActive: warehouse.isActive
        });
        setEditingId(warehouse._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this warehouse?')) return;

        try {
            const response = await fetch(`${API_URL}/api/warehouses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                fetchWarehouses();
                alert('Warehouse deleted successfully');
            } else {
                const data = await response.json();
                alert(data.message || 'Error deleting warehouse');
            }
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('Error deleting warehouse');
        }
    };

    const handleViewInventory = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowInventory(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            location: {
                address: '',
                city: '',
                state: '',
                pincode: ''
            },
            serviceablePincodes: '',
            manager: {
                name: '',
                email: '',
                phone: ''
            },
            isActive: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) return <div className="loading">Loading warehouses...</div>;

    return (
        <div className="manage-warehouses-container">
            <div className="page-header">
                <h1>📦 Manage Warehouses</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '+ Add Warehouse'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="warehouse-form-card">
                    <h2>{editingId ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Warehouse Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Warehouse Code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                    disabled={editingId !== null}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address *</label>
                            <input
                                type="text"
                                value={formData.location.address}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, address: e.target.value }
                                })}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    value={formData.location.city}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        location: { ...formData.location, city: e.target.value }
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    value={formData.location.state}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        location: { ...formData.location, state: e.target.value }
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={formData.location.pincode}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val)) {
                                            setFormData({
                                                ...formData,
                                                location: { ...formData.location, pincode: val }
                                            });
                                        }
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Serviceable Pincodes (comma-separated)</label>
                            <textarea
                                rows="3"
                                value={formData.serviceablePincodes}
                                onChange={(e) => setFormData({ ...formData, serviceablePincodes: e.target.value })}
                                placeholder="e.g., 400001, 400002, 400003"
                            />
                        </div>

                        <h3>Manager Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Manager Name</label>
                                <input
                                    type="text"
                                    value={formData.manager.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        manager: { ...formData.manager, name: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Manager Email</label>
                                <input
                                    type="email"
                                    value={formData.manager.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        manager: { ...formData.manager, email: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Manager Phone</label>
                                <input
                                    type="tel"
                                    value={formData.manager.phone}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        manager: { ...formData.manager, phone: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                Active
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Update' : 'Create'} Warehouse
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="warehouses-grid">
                {warehouses.length === 0 ? (
                    <div className="empty-state">
                        <p>No warehouses found. Create your first warehouse to get started.</p>
                    </div>
                ) : (
                    warehouses.map(warehouse => (
                        <div key={warehouse._id} className="warehouse-card">
                            <div className="warehouse-header">
                                <h3>{warehouse.name}</h3>
                                <span className={`status-badge ${warehouse.isActive ? 'active' : 'inactive'}`}>
                                    {warehouse.isActive ? '✓ Active' : '✗ Inactive'}
                                </span>
                            </div>
                            <div className="warehouse-code">Code: {warehouse.code}</div>
                            <div className="warehouse-details">
                                <p><strong>📍 Location:</strong> {warehouse.location.city}, {warehouse.location.state}</p>
                                <p><strong>📮 Pincodes:</strong> {warehouse.serviceablePincodes.length} serviceable</p>
                                <p><strong>📦 Inventory:</strong> {warehouse.inventory?.length || 0} products</p>
                                {warehouse.manager?.name && (
                                    <p><strong>👤 Manager:</strong> {warehouse.manager.name}</p>
                                )}
                            </div>
                            <div className="warehouse-actions">
                                <button
                                    className="btn-view"
                                    onClick={() => handleViewInventory(warehouse)}
                                >
                                    View Inventory
                                </button>
                                <button
                                    className="btn-edit"
                                    onClick={() => handleEdit(warehouse)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(warehouse._id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Inventory Modal */}
            {showInventory && selectedWarehouse && (
                <div className="modal-overlay" onClick={() => setShowInventory(false)}>
                    <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📦 Inventory - {selectedWarehouse.name}</h2>
                            <button className="modal-close" onClick={() => setShowInventory(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {selectedWarehouse.inventory && selectedWarehouse.inventory.length > 0 ? (
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Stock</th>
                                            <th>Reserved</th>
                                            <th>Available</th>
                                            <th>Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedWarehouse.inventory.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.product?.name || 'Unknown Product'}</td>
                                                <td>{item.stock}</td>
                                                <td>{item.reservedStock || 0}</td>
                                                <td><strong>{item.stock - (item.reservedStock || 0)}</strong></td>
                                                <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No inventory items in this warehouse.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageWarehouses;
