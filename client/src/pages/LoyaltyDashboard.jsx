import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import TierBadge from '../components/loyalty/TierBadge';
import PointsDisplay from '../components/loyalty/PointsDisplay';
import ReferralCode from '../components/loyalty/ReferralCode';
import RewardsHistory from '../components/loyalty/RewardsHistory';
import LoadingSpinner from '../components/LoadingSpinner';

const LoyaltyDashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLoyaltyData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/loyalty/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch loyalty data');
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                console.error('Error fetching loyalty data:', err);
                setError('Failed to load rewards dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchLoyaltyData();
        }
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (!dashboardData) return null;

    const { points, tier, referralCode, tierBenefits, nextTier, pointsToNextTier, pointsHistory } = dashboardData;

    // Calculate progress to next tier
    const progressPercentage = nextTier
        ? Math.min(100, (dashboardData.totalSpent / (dashboardData.totalSpent + pointsToNextTier)) * 100)
        : 100;

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '1000px',
            margin: '0 auto'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333',
            margin: 0
        },
        cardGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0'
        },
        cardTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#555',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        benefitsList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        benefitItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            color: '#444'
        },
        checkIcon: {
            color: '#28a745',
            marginRight: '10px',
            fontWeight: 'bold'
        },
        progressBarContainer: {
            height: '8px',
            background: '#e9ecef',
            borderRadius: '4px',
            marginTop: '15px',
            overflow: 'hidden'
        },
        progressBar: {
            height: '100%',
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            width: `${progressPercentage}%`,
            transition: 'width 0.5s ease-in-out'
        },
        progressText: {
            fontSize: '0.85rem',
            color: '#666',
            marginTop: '8px',
            textAlign: 'right'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Rewards</h1>
                <TierBadge tier={tier} size="large" />
            </div>

            <div style={styles.cardGrid}>
                {/* Points Card */}
                <div style={styles.card}>
                    <div style={styles.cardTitle}>Current Balance</div>
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <PointsDisplay points={points} size="large" />
                        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
                            Value: ₹{(points / 10).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Tier Status Card */}
                <div style={styles.card}>
                    <div style={styles.cardTitle}>Tier Status</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{tier}</span>
                        {nextTier && <span style={{ color: '#888' }}>Next: {nextTier}</span>}
                    </div>

                    {nextTier ? (
                        <>
                            <div style={styles.progressBarContainer}>
                                <div style={styles.progressBar}></div>
                            </div>
                            <div style={styles.progressText}>
                                Spend ₹{pointsToNextTier.toLocaleString()} more to reach {nextTier}
                            </div>
                        </>
                    ) : (
                        <div style={{ ...styles.progressText, textAlign: 'center', color: '#28a745' }}>
                            You've reached the top tier! 🏆
                        </div>
                    )}
                </div>

                {/* Benefits Card */}
                <div style={styles.card}>
                    <div style={styles.cardTitle}>Your Benefits</div>
                    <ul style={styles.benefitsList}>
                        <li style={styles.benefitItem}>
                            <span style={styles.checkIcon}>✓</span>
                            {(tierBenefits.discount * 100)}% Discount on all orders
                        </li>
                        {tierBenefits.freeShipping && (
                            <li style={styles.benefitItem}>
                                <span style={styles.checkIcon}>✓</span>
                                Free Shipping
                            </li>
                        )}
                        {tierBenefits.earlyAccess && (
                            <li style={styles.benefitItem}>
                                <span style={styles.checkIcon}>✓</span>
                                Early Access to Sales
                            </li>
                        )}
                        {tierBenefits.prioritySupport && (
                            <li style={styles.benefitItem}>
                                <span style={styles.checkIcon}>✓</span>
                                Priority Support
                            </li>
                        )}
                        <li style={styles.benefitItem}>
                            <span style={styles.checkIcon}>✓</span>
                            Earn 1 point per ₹1 spent
                        </li>
                    </ul>
                </div>

                {/* Referral Card */}
                <div style={styles.card}>
                    <div style={styles.cardTitle}>Refer & Earn</div>
                    <ReferralCode code={referralCode} />
                </div>
            </div>

            <RewardsHistory history={pointsHistory} />
        </div>
    );
};

export default LoyaltyDashboard;
