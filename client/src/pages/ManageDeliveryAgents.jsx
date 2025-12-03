import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './ManageDeliveryAgents.css';
import './AgentDetailsModal.css';

const ManageDeliveryAgents = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [deliveryAgents, setDeliveryAgents] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        assignedArea: '',
        assignedPincodes: []
    });

    useEffect(() => {
        fetchDeliveryAgents();
    }, []);

    const fetchDeliveryAgents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/delivery-agents`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDeliveryAgents(data);
            }
        } catch (error) {
            console.error('Error fetching delivery agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleViewDetails = (agent) => {
        setSelectedAgent(agent);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAgent(null);
    };

    const handleEditAgent = (agent) => {
        setEditFormData({
            name: agent.name,
            email: agent.email,
            phone: agent.phone || '',
            assignedArea: agent.assignedArea || '',
            assignedPincodes: agent.assignedPincodes || []
        });
        setSelectedAgent(agent);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedAgent(null);
        setEditFormData({
            name: '',
            email: '',
            phone: '',
            assignedArea: '',
            assignedPincodes: []
        });
    };

    const handleEditInputChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateAgent = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/delivery-agents/${selectedAgent._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (response.ok) {
                alert('✅ Agent updated successfully!');
                handleCloseEditModal();
                fetchDeliveryAgents();
            } else {
                const error = await response.json();
                alert(error.message || 'Error updating agent');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating agent');
        }
    };

    return (
        <div className="manage-agents-page">
            <div className="container">
                <h1>👥 Manage Delivery Agents</h1>
                <p className="subtitle">View and manage all delivery agents in your system</p>

                <div className="action-bar">
                    <button
                        className="btn-back"
                        onClick={() => navigate('/admin/dashboard')}
                        style={{
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            marginRight: '10px'
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        className="btn-register"
                        onClick={() => navigate('/admin/delivery-agents/register')}
                    >
                        <span>➕</span>
                        <span>Register New Agent</span>
                    </button>

                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            🔲 Grid
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            📋 Table
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="agents-section">
                        <div className="empty-state">
                            <div className="empty-state-icon">⏳</div>
                            <h3>Loading agents...</h3>
                        </div>
                    </div>
                ) : deliveryAgents.length === 0 ? (
                    <div className="agents-section">
                        <div className="empty-state">
                            <div className="empty-state-icon">👤</div>
                            <h3>No Delivery Agents Yet</h3>
                            <p>Get started by registering your first delivery agent</p>
                            <button
                                className="btn-register"
                                onClick={() => navigate('/admin/delivery-agents/register')}
                            >
                                <span>➕</span>
                                <span>Register First Agent</span>
                            </button>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="agents-grid">
                        {deliveryAgents.map(agent => (
                            <div key={agent._id} className="agent-card">
                                <div className="agent-avatar">
                                    {getInitials(agent.name)}
                                </div>
                                <h3 className="agent-name">{agent.name}</h3>
                                <p className="agent-email">{agent.email}</p>

                                <div className="agent-info">
                                    <div className="info-row">
                                        <span className="info-label">📍 Assigned Area</span>
                                        <span className="info-value">{agent.assignedArea || 'Not Set'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">📦 Active Orders</span>
                                        <span className="info-value">{agent.activeOrders || 0}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">📞 Phone</span>
                                        <span className="info-value">{agent.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">📅 Registered</span>
                                        <span className="info-value">
                                            {new Date(agent.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Status</span>
                                        <span className="info-value" style={{ color: '#43e97b' }}>
                                            ✓ Active
                                        </span>
                                    </div>
                                </div>

                                <div className="agent-actions">
                                    <button
                                        className="btn-view"
                                        onClick={() => handleViewDetails(agent)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEditAgent(agent)}
                                        style={{
                                            marginTop: '8px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            width: '100%'
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="agents-section">
                        <div className="section-header">
                            <h2>All Delivery Agents ({deliveryAgents.length})</h2>
                        </div>
                        <table className="agents-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Assigned Area</th>
                                    <th>Active Orders</th>
                                    <th>Registered</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryAgents.map(agent => (
                                    <tr key={agent._id}>
                                        <td>
                                            <strong>{agent.name}</strong>
                                        </td>
                                        <td>{agent.email}</td>
                                        <td>{agent.phone || 'N/A'}</td>
                                        <td>
                                            <span style={{
                                                color: 'var(--primary-color)',
                                                fontWeight: 600
                                            }}>
                                                {agent.assignedArea || 'Not Set'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'var(--background-dark)',
                                                padding: '4px 12px',
                                                borderRadius: 'var(--radius-full)',
                                                fontWeight: 600
                                            }}>
                                                {agent.activeOrders || 0}
                                            </span>
                                        </td>
                                        <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{
                                                color: 'var(--success-color)',
                                                fontWeight: 600
                                            }}>
                                                ✓ Active
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleViewDetails(agent)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditAgent(agent)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Agent Details Modal */}
                {showModal && selectedAgent && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="agent-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <button className="modal-close" onClick={handleCloseModal}>
                                    ×
                                </button>
                                <div className="modal-agent-avatar">
                                    {getInitials(selectedAgent.name)}
                                </div>
                                <h2 className="modal-agent-name">{selectedAgent.name}</h2>
                                <p className="modal-agent-email">{selectedAgent.email}</p>
                            </div>

                            <div className="modal-body">
                                <div className="detail-section">
                                    <h3>📊 Performance Statistics</h3>
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <h4>Active Orders</h4>
                                            <p>{selectedAgent.activeOrders || 0}</p>
                                        </div>
                                        <div className="stat-item">
                                            <h4>Total Delivered</h4>
                                            <p>{selectedAgent.totalDelivered || 0}</p>
                                        </div>
                                        <div className="stat-item">
                                            <h4>Success Rate</h4>
                                            <p>
                                                {selectedAgent.totalAssigned > 0
                                                    ? Math.round((selectedAgent.totalDelivered / selectedAgent.totalAssigned) * 100) + '%'
                                                    : '0%'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>📍 Assignment Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <div className="detail-label">Assigned Area</div>
                                            <div className="detail-value">{selectedAgent.assignedArea || 'Not Set'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Status</div>
                                            <div className="detail-value" style={{ color: '#43e97b' }}>✓ Active</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>📞 Contact Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <div className="detail-label">Phone Number</div>
                                            <div className="detail-value">{selectedAgent.phone || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Email Address</div>
                                            <div className="detail-value" style={{ fontSize: '0.9rem' }}>{selectedAgent.email}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>📅 Account Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <div className="detail-label">Registered On</div>
                                            <div className="detail-value">{new Date(selectedAgent.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Agent ID</div>
                                            <div className="detail-value" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedAgent._id}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-modal-close" onClick={handleCloseModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Agent Modal */}
                {showEditModal && selectedAgent && (
                    <div className="modal-overlay" onClick={handleCloseEditModal}>
                        <div className="agent-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <button className="modal-close" onClick={handleCloseEditModal}>
                                    ×
                                </button>
                                <h2 className="modal-agent-name">✏️ Edit Delivery Agent</h2>
                                <p className="modal-agent-email">Update agent information</p>
                            </div>

                            <div className="modal-body">
                                <form onSubmit={handleUpdateAgent}>
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
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '1rem'
                                            }}
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
                                            value={editFormData.email}
                                            onChange={handleEditInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '1rem'
                                            }}
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
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleEditInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '1rem'
                                            }}
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
                                            value={editFormData.assignedArea}
                                            onChange={handleEditInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <small style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                                            This agent will be automatically assigned orders from this city
                                        </small>
                                    </div>

                                    <div style={{ marginBottom: '30px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            color: '#555',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>
                                            Assigned Pincodes (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="assignedPincodes"
                                            placeholder="e.g., 400001, 400002, 400003"
                                            value={editFormData.assignedPincodes.join(', ')}
                                            onChange={(e) => {
                                                const pincodes = e.target.value
                                                    .split(',')
                                                    .map(p => p.trim())
                                                    .filter(p => p);
                                                setEditFormData({ ...editFormData, assignedPincodes: pincodes });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <small style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                                            Agent will be prioritized for orders to these pincodes
                                        </small>
                                    </div>

                                    <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="submit"
                                            style={{
                                                flex: 1,
                                                padding: '12px 30px',
                                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✓ Update Agent
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseEditModal}
                                            className="btn-modal-close"
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageDeliveryAgents;
