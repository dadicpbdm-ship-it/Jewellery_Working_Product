import React from 'react';
import './OrderTimeline.css';

const OrderTimeline = ({ status, statusHistory, createdAt, deliveredAt }) => {
    // Define timeline steps
    const steps = [
        { key: 'pending', label: 'Order Placed', icon: '🛒' },
        { key: 'confirmed', label: 'Confirmed', icon: '✅' },
        { key: 'processing', label: 'Processing', icon: '📦' },
        { key: 'shipped', label: 'Out for Delivery', icon: '🚚' },
        { key: 'delivered', label: 'Delivered', icon: '✓' }
    ];

    // Helper to get status index
    const getStatusIndex = (s) => steps.findIndex(step => step.key === s);
    const currentStatusIndex = getStatusIndex(status);

    // Helper to find history entry for a step
    const getHistoryEntry = (stepKey) => {
        if (!statusHistory) return null;
        // Special case for 'pending' (creation time)
        if (stepKey === 'pending') {
            return { timestamp: createdAt, note: 'Order placed successfully' };
        }
        return statusHistory.find(h => h.status === stepKey);
    };

    return (
        <div className="order-timeline-container">
            <div className="timeline-header">
                <h3>Order Status</h3>
                <p>Track your package journey</p>
            </div>

            <div className="timeline-wrapper">
                {/* Progress Bar Background */}
                <div className="timeline-track">
                    {/* Active Progress Bar */}
                    <div
                        className="timeline-progress"
                        style={{ height: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isActive = index === currentStatusIndex;
                    const historyEntry = getHistoryEntry(step.key);
                    const date = historyEntry ? new Date(historyEntry.timestamp).toLocaleString() :
                        (step.key === 'delivered' && deliveredAt ? new Date(deliveredAt).toLocaleString() : null);

                    return (
                        <div
                            key={step.key}
                            className={`timeline-step ${isCompleted ? 'completed' : 'pending'} ${isActive ? 'active' : ''}`}
                        >
                            {/* Left Content (Alternating) */}
                            <div className={`step-content left`} style={{ opacity: index % 2 === 0 ? 1 : 0 }}>
                                {index % 2 === 0 && (
                                    <>
                                        <div className="step-label">{step.label}</div>
                                        {date && <div className="step-date">{date}</div>}
                                        {historyEntry?.note && <div className="step-note">{historyEntry.note}</div>}
                                    </>
                                )}
                            </div>

                            {/* Icon */}
                            <div className="step-icon-wrapper">
                                {step.icon}
                            </div>

                            {/* Right Content (Alternating) */}
                            <div className={`step-content right`} style={{ opacity: index % 2 !== 0 ? 1 : 0 }}>
                                {index % 2 !== 0 && (
                                    <>
                                        <div className="step-label">{step.label}</div>
                                        {date && <div className="step-date">{date}</div>}
                                        {historyEntry?.note && <div className="step-note">{historyEntry.note}</div>}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
