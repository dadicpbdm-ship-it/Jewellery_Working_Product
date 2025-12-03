import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import './ManagePincodes.css';

const ManagePincodes = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        city: '',
        state: '',
        deliveryDays: 3,
        codAvailable: true,
        isActive: true
    });

    useEffect(() => {
        fetchPincodes();
    }, []);

    const fetchPincodes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pincodes`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPincodes(data);
            }
        } catch (error) {
            console.error('Error fetching pincodes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `${API_URL}/api/pincodes/${editingId}`
                : `${API_URL}/api/pincodes`;

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchPincodes();
                resetForm();
                alert(editingId ? 'Pincode updated successfully' : 'Pincode added successfully');
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving pincode');
            }
        } catch (error) {
            console.error('Error saving pincode:', error);
            alert('Error saving pincode');
        }
    };

    const handleEdit = (pincode) => {
        setFormData({
            code: pincode.code,
            city: pincode.city,
            state: pincode.state,
            deliveryDays: pincode.deliveryDays,
            codAvailable: pincode.codAvailable,
            isActive: pincode.isActive
        });
        setEditingId(pincode._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pincode?')) return;

        try {
            const response = await fetch(`${API_URL}/api/pincodes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                fetchPincodes();
                alert('Pincode deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting pincode:', error);
            alert('Error deleting pincode');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            city: '',
            state: '',
            deliveryDays: 3,
            codAvailable: true,
            isActive: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) return <div className="loading">Loading pincodes...</div>;

    return (
        <div className="manage-pincodes-container">
            <div className="page-header">
                <h1>Manage Pincodes</h1>
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
                        {showForm ? 'Cancel' : '+ Add Pincode'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="pincode-form-card">
                    <h2>{editingId ? 'Edit Pincode' : 'Add New Pincode'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={formData.code}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val)) {
                                            setFormData({ ...formData, code: val });
                                        }
                                    }}
                                    required
                                    disabled={editingId !== null}
                                />
                            </div>
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Delivery Days *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.deliveryDays}
                                    onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.codAvailable}
                                        onChange={(e) => setFormData({ ...formData, codAvailable: e.target.checked })}
                                    />
                                    COD Available
                                </label>
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
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Update' : 'Add'} Pincode
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="pincodes-table-card">
                <h2>Serviceable Pincodes ({pincodes.length})</h2>
                <div className="table-responsive">
                    <table className="pincodes-table">
                        <thead>
                            <tr>
                                <th>Pincode</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Delivery Days</th>
                                <th>COD</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pincodes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                        No pincodes added yet
                                    </td>
                                </tr>
                            ) : (
                                pincodes.map(pincode => (
                                    <tr key={pincode._id}>
                                        <td><strong>{pincode.code}</strong></td>
                                        <td>{pincode.city}</td>
                                        <td>{pincode.state}</td>
                                        <td>{pincode.deliveryDays} days</td>
                                        <td>
                                            <span className={`badge ${pincode.codAvailable ? 'badge-success' : 'badge-danger'}`}>
                                                {pincode.codAvailable ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${pincode.isActive ? 'badge-success' : 'badge-warning'}`}>
                                                {pincode.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => handleEdit(pincode)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(pincode._id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagePincodes;
