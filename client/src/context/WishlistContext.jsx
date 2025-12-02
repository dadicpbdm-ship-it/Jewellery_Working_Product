import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useToast } from './ToastContext';
import { API_URL } from '../config';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useContext(AuthContext);
    const { success, error, info } = useToast();

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const response = await fetch(`${API_URL}/api/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        }
    };

    const addToWishlist = async (productId) => {
        if (!user) {
            info('Please login to add items to wishlist');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/wishlist/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ productId })
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
                success('Added to wishlist');
            }
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/api/wishlist/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ productId })
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
                info('Removed from wishlist');
            }
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            error('Failed to remove from wishlist');
        }
    };

    const clearWishlist = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/api/wishlist/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setWishlist([]);
                success('Wishlist cleared');
            }
        } catch (err) {
            console.error('Error clearing wishlist:', err);
            error('Failed to clear wishlist');
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
