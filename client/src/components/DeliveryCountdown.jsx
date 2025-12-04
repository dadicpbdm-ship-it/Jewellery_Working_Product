import React, { useState, useEffect } from 'react';

const DeliveryCountdown = ({ estimatedDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(estimatedDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && interval !== 'seconds') {
            return;
        }

        timerComponents.push(
            <span key={interval} className="countdown-segment">
                <span className="countdown-value">{timeLeft[interval]}</span>
                <span className="countdown-label">{interval}</span>
            </span>
        );
    });

    return (
        <div className="delivery-countdown-container" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', opacity: 0.9 }}>
                📦 Arriving In
            </h3>
            <div className="countdown-timer" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
            }}>
                {timerComponents.length ? timerComponents : <span>Arriving soon!</span>}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                Estimated Delivery: {new Date(estimatedDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </p>

            <style jsx>{`
                .countdown-segment {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .countdown-value {
                    font-size: 2rem;
                    line-height: 1;
                }
                .countdown-label {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    opacity: 0.8;
                    margin-top: 0.25rem;
                    font-weight: normal;
                }
            `}</style>
        </div>
    );
};

export default DeliveryCountdown;
