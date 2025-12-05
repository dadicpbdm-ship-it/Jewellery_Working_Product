import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { API_URL } from '../config';

export const RewardsContext = createContext();

export const RewardsProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [balance, setBalance] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalRedeemed, setTotalRedeemed] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBalance();
        } else {
            // Reset when user logs out
            setBalance(0);
            setTotalEarned(0);
            setTotalRedeemed(0);
        }
    }, [user]);

    const fetchBalance = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/rewards/balance`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance);
                setTotalEarned(data.totalEarned);
                setTotalRedeemed(data.totalRedeemed);
            }
        } catch (error) {
            console.error('Error fetching reward balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        balance,
        totalEarned,
        totalRedeemed,
        loading,
        refreshBalance: fetchBalance
    };

    return (
        <RewardsContext.Provider value={value}>
            {children}
        </RewardsContext.Provider>
    );
};

export const useRewards = () => {
    const context = useContext(RewardsContext);
    if (!context) {
        throw new Error('useRewards must be used within RewardsProvider');
    }
    return context;
};
