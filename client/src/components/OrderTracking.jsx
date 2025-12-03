import React from 'react';
import './OrderTracking.css';

const OrderTracking = ({ order }) => {
    const getStatusTimeline = (order) => {
        const steps = [
            { label: 'Placed', completed: true, date: order.createdAt },
            { label: 'Processing', completed: true, date: order.createdAt },
            { label: 'Shipped', completed: order.isDelivered, date: order.deliveredAt },
            { label: 'Delivered', completed: order.isDelivered, date: order.deliveredAt }
        ];
        return steps;
    };

    const timelineSteps = getStatusTimeline(order);

    return (
        <div className="order-tracking-container">
            <div className="order-timeline">
                {timelineSteps.map((step, idx) => (
                    <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                        <div className="step-marker"></div>
                        <div className="step-label">{step.label}</div>
                        {step.date && step.completed && (
                            <div className="step-date">
                                {new Date(step.date).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderTracking;
