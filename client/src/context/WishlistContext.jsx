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
                // Backend returns object with products array
                setWishlist(data.products || []);
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
                setWishlist(data.products || []);
                success('Added to wishlist');
            } else {
                const errData = await response.json();
                if (errData.message === 'Product already in wishlist') {
                    info('Product already in wishlist');
                } else {
                    error(errData.message || 'Failed to add to wishlist');
                }
            }
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data.products || []);
                info('Removed from wishlist');
            }
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            error('Failed to remove from wishlist');
        }
    };

    const clearWishlist = async () => {
        // Not implemented in backend yet, just clear local state
        setWishlist([]);
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product && item.product._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
