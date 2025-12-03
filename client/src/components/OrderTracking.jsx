import React from 'react';
import './OrderTracking.css';

const OrderTracking = ({ order }) => {
    const getStatusTimeline = (order) => {
        let steps = [
            { label: 'Placed', completed: true, date: order.createdAt },
            { label: 'Processing', completed: true, date: order.createdAt },
            { label: 'Shipped', completed: order.isDelivered, date: order.deliveredAt },
            { label: 'Delivered', completed: order.isDelivered, date: order.deliveredAt }
        ];

        // Handle Return/Exchange Logic
        if (order.returnExchangeRequest && order.returnExchangeRequest.type !== 'None') {
            const req = order.returnExchangeRequest;
            const isReturn = req.type === 'Return';

            // Add Request Step
            steps.push({
                label: `${req.type} Requested`,
                completed: true,
                date: req.requestDate
            });

            // Add Approval Step
            const isApproved = ['Approved', 'Completed'].includes(req.status);
            steps.push({
                label: `${req.type} Approved`,
                completed: isApproved,
                date: isApproved ? req.updatedAt : null // Approximate date if not tracked separately
            });

            // Add Pickup/Completion Step
            const isCompleted = req.status === 'Completed';
            steps.push({
                label: 'Picked Up',
                completed: isCompleted,
                date: isCompleted ? req.updatedAt : null
            });

            // Add Final Step (Refund or Exchange Sent)
            if (isReturn) {
                steps.push({
                    label: 'Refunded',
                    completed: order.isRefunded,
                    date: order.refundedAt
                });
            } else {
                steps.push({
                    label: 'Replacement Sent',
                    completed: isCompleted, // Assuming replacement is sent after pickup/completion for now
                    date: isCompleted ? req.updatedAt : null
                });
            }
        }

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
