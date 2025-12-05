import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { RewardsContext } from '../context/RewardsContext';
import { API_URL } from '../config';
import './RewardsTab.css';

const RewardsTab = () => {
    const { user } = useContext(AuthContext);
    const { balance, totalEarned, totalRedeemed, refreshBalance } = useContext(RewardsContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/rewards/history`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rewards-tab">
            {/* Points Summary */}
            <div className="rewards-summary">
                <div className="summary-card balance">
                    <div className="card-icon">🏆</div>
                    <div className="card-content">
                        <h3>Current Balance</h3>
                        <p className="points-value">{balance.toLocaleString('en-IN')} pts</p>
                        <small>= ₹{balance.toLocaleString('en-IN')}</small>
                    </div>
                </div>
                <div className="summary-card earned">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h3>Total Earned</h3>
                        <p className="points-value">{totalEarned.toLocaleString('en-IN')} pts</p>
                    </div>
                </div>
                <div className="summary-card redeemed">
                    <div className="card-icon">🎁</div>
                    <div className="card-content">
                        <h3>Total Redeemed</h3>
                        <p className="points-value">{totalRedeemed.toLocaleString('en-IN')} pts</p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="how-it-works">
                <h3>How Reward Points Work</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-icon">💸</span>
                        <div>
                            <h4>Earn Points</h4>
                            <p>Get 1% of your order value as points (e.g., ₹10,000 order = 100 points)</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">🛒</span>
                        <div>
                            <h4>Redeem Points</h4>
                            <p>Use points at checkout: 1 point = ₹1 discount</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">⏰</span>
                        <div>
                            <h4>No Expiry</h4>
                            <p>Your points never expire - use them whenever you want!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="transaction-history">
                <h3>Transaction History</h3>
                {loading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                    <p className="no-transactions">No transactions yet. Start shopping to earn points!</p>
                ) : (
                    <div className="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn, index) => (
                                    <tr key={index}>
                                        <td>{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <span className={`txn-type ${txn.type}`}>
                                                {txn.type === 'earned' ? '📈 Earned' : '📉 Redeemed'}
                                            </span>
                                        </td>
                                        <td>{txn.description}</td>
                                        <td className={txn.type === 'earned' ? 'points-positive' : 'points-negative'}>
                                            {txn.type === 'earned' ? '+' : '-'}{txn.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardsTab;
