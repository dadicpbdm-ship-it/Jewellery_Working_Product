import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import OrderTimeline from '../components/OrderTimeline';
import DeliveryCountdown from '../components/DeliveryCountdown';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnType, setReturnType] = useState('Return');
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const headers = {};
                if (user && user.token) {
                    headers['Authorization'] = `Bearer ${user.token}`;
                }

                const response = await fetch(`${API_URL}/api/orders/${id}`, {
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error('Order not found');
                }

                const data = await response.json();
                setOrder(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching order:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user]);

    const generateInvoice = async () => {
        if (!order) return;

        try {
            // Dynamic import to handle missing library gracefully
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.default;
            await import('jspdf-autotable');

            const doc = new jsPDF();

            // Company Header
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('JewelIndia', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Premium Jewellery Collection', 105, 28, { align: 'center' });
            doc.text('Email: contact@jewelindia.com | Phone: +91 1234567890', 105, 34, { align: 'center' });

            // Invoice Title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('INVOICE', 105, 50, { align: 'center' });

            // Order Information
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Order ID: ${order._id}`, 20, 65);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 20, 72);
            doc.text(`Status: ${order.isDelivered ? 'Delivered' : 'Processing'}`, 20, 79);

            // Customer Information
            doc.setFont('helvetica', 'bold');
            doc.text('Bill To:', 20, 92);
            doc.setFont('helvetica', 'normal');
            doc.text(order.user?.name || 'Customer', 20, 99);
            doc.text(order.user?.email || '', 20, 106);

            // Shipping Address
            doc.setFont('helvetica', 'bold');
            doc.text('Ship To:', 120, 92);
            doc.setFont('helvetica', 'normal');
            doc.text(order.shippingAddress.address, 120, 99);
            doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 120, 106);
            doc.text(order.shippingAddress.country, 120, 113);

            // Items Table
            const tableData = order.orderItems.map(item => [
                item.name,
                item.quantity.toString(),
                `₹${item.price.toLocaleString('en-IN')}`,
                `₹${(item.quantity * item.price).toLocaleString('en-IN')}`
            ]);

            doc.autoTable({
                startY: 125,
                head: [['Item', 'Quantity', 'Price', 'Total']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] },
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 40, halign: 'right' },
                    3: { cellWidth: 40, halign: 'right' }
                }
            });

            // Price Summary
            const finalY = doc.lastAutoTable.finalY + 10;
            const summaryX = 130;

            doc.setFont('helvetica', 'normal');
            doc.text('Subtotal:', summaryX, finalY);
            doc.text(`₹${(order.totalPrice - order.taxPrice - order.shippingPrice).toLocaleString('en-IN')}`, 190, finalY, { align: 'right' });

            doc.text('Tax:', summaryX, finalY + 7);
            doc.text(`₹${order.taxPrice.toLocaleString('en-IN')}`, 190, finalY + 7, { align: 'right' });

            doc.text('Shipping:', summaryX, finalY + 14);
            doc.text(`₹${order.shippingPrice.toLocaleString('en-IN')}`, 190, finalY + 14, { align: 'right' });

            // Total
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Total:', summaryX, finalY + 24);
            doc.text(`₹${order.totalPrice.toLocaleString('en-IN')}`, 190, finalY + 24, { align: 'right' });

            // Payment Information
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Payment Method: ${order.paymentMethod}`, 20, finalY + 35);
            doc.text(`Payment Status: ${order.isPaid ? 'Paid' : 'Pending'}`, 20, finalY + 42);

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Thank you for your business!', 105, 280, { align: 'center' });
            doc.text('For any queries, please contact us at contact@jewelindia.com', 105, 285, { align: 'center' });

            // Save PDF
            doc.save(`Invoice_${order._id}.pdf`);
        } catch (error) {
            console.error('Error loading jsPDF:', error);
            alert('PDF library not installed!\n\nPlease install it by running:\nnpm install jspdf jspdf-autotable\n\nOr use the "Print Invoice" button instead.');
        }
    };

    const printInvoice = () => {
        window.print();
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        if (!returnReason.trim()) {
            alert('Please provide a reason');
            return;
        }

        setSubmittingReturn(true);
        try {
            const response = await fetch(`${API_URL}/api/orders/${id}/return-exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    type: returnType,
                    reason: returnReason
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit request');
            }

            const updatedOrder = await response.json();
            setOrder(updatedOrder);
            setShowReturnModal(false);
            alert('Request submitted successfully!');
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmittingReturn(false);
        }
    };

    if (loading) {
        return <div className="container">Loading order details...</div>;
    }

    if (error) {
        return (
            <div className="container error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container">
                <h2>Order not found</h2>
                <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
            </div>
        );
    }

    const subtotal = order.totalPrice - order.taxPrice - order.shippingPrice;

    const getBackLink = () => {
        if (user && user.role === 'admin') {
            return <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>;
        }
        if (user && user.role === 'delivery') {
            return <Link to="/delivery/dashboard" className="back-link">← Back to Dashboard</Link>;
        }
        return <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>;
    };

    return (
        <div className="container order-details-page">
            <div className="order-details-header">
                {getBackLink()}
                <div className="invoice-buttons">
                    <button onClick={generateInvoice} className="btn-download-invoice">
                        📄 Download PDF
                    </button>
                    <button onClick={printInvoice} className="btn-print-invoice">
                        🖨️ Print Invoice
                    </button>
                    {order.isDelivered && (!order.returnExchangeRequest || order.returnExchangeRequest.type === 'None') && (
                        <button onClick={() => setShowReturnModal(true)} className="btn-return-exchange">
                            🔄 Return / Exchange
                        </button>
                    )}
                </div>
            </div>

            {/* Order Tracking Section */}
            {/* Enhanced Order Tracking Section */}
            <div className="enhanced-tracking-section">
                {!order.isDelivered && order.estimatedDeliveryDate && (
                    <DeliveryCountdown estimatedDate={order.estimatedDeliveryDate} />
                )}

                <OrderTimeline
                    status={order.isDelivered ? 'delivered' : (order.statusHistory?.slice(-1)[0]?.status || 'pending')}
                    statusHistory={order.statusHistory}
                    createdAt={order.createdAt}
                    deliveredAt={order.deliveredAt}
                />

                {/* Delivery Agent Information */}
                {order.deliveryAgent && !order.isDelivered && (
                    <div className="delivery-agent-card" style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginTop: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div className="agent-avatar" style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            👤
                        </div>
                        <div className="agent-info">
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#1f2937' }}>{order.deliveryAgent.name}</h4>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Your Delivery Partner</p>
                            <div style={{ marginTop: '0.5rem' }}>
                                <a href={`tel:${order.deliveryAgent.phone}`} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}>
                                    📞 Call Partner
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="order-details-card">
                <div className="order-summary-header">
                    <h2>Order Details</h2>
                    <span className={`status-badge ${order.isDelivered ? 'delivered' : 'processing'}`}>
                        {order.isDelivered ? '✓ Delivered' : '⏳ Processing'}
                    </span>
                    {order.returnExchangeRequest && order.returnExchangeRequest.type !== 'None' && (
                        <div className={`return-status-badge status-${order.returnExchangeRequest.status.toLowerCase()}`}>
                            {order.returnExchangeRequest.type}: {order.returnExchangeRequest.status}
                        </div>
                    )}
                </div>

                <div className="order-info-grid">
                    <div className="info-section">
                        <h3>Order Information</h3>
                        <p><strong>Order ID:</strong> {order._id}</p>
                        <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Payment Status:</strong>
                            <span className={order.isPaid ? 'text-success' : 'text-warning'}>
                                {order.isPaid ? ' Paid' : ' Pending'}
                            </span>
                        </p>
                    </div>

                    <div className="info-section">
                        <h3>Shipping Address</h3>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                </div>

                <div className="order-items-section">
                    <h3>Order Items</h3>
                    <div className="items-list">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="order-item-detail">
                                <img src={item.image} alt={item.name} />
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p className="item-price">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                                </div>
                                <div className="item-total">
                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="price-summary">
                    <h3>Price Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax:</span>
                        <span>₹{order.taxPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping:</span>
                        <span>₹{order.shippingPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total:</span>
                        <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
            {showReturnModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Request Return or Exchange</h3>
                        <form onSubmit={handleReturnSubmit}>
                            <div className="form-group">
                                <label>Type:</label>
                                <select value={returnType} onChange={(e) => setReturnType(e.target.value)}>
                                    <option value="Return">Return</option>
                                    <option value="Exchange">Exchange</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Reason:</label>
                                <textarea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    required
                                    placeholder="Please describe why you want to return/exchange..."
                                    rows="4"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowReturnModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submittingReturn}>
                                    {submittingReturn ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
