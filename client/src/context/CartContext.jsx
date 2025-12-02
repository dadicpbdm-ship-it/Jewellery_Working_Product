import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { success } = useToast();
    const { user } = useContext(AuthContext);

    // We store userId in state to prevent race conditions where we might 
    // save the previous user's cart to the new user's storage key during a transition.
    const [cartState, setCartState] = useState({
        userId: null, // 'guest' or user._id
        items: []
    });

    // Load cart when user changes
    useEffect(() => {
        const currentUserId = user ? user._id : 'guest';
        const key = user ? `cart_${user._id}` : 'cart';

        try {
            const localData = localStorage.getItem(key);
            const items = localData ? JSON.parse(localData) : [];
            setCartState({ userId: currentUserId, items });
        } catch (error) {
            console.error('Error parsing cart data:', error);
            setCartState({ userId: currentUserId, items: [] });
        }
    }, [user]);

    // Save cart when items change, but ONLY if the state owner matches the current user
    useEffect(() => {
        const currentUserId = user ? user._id : 'guest';

        // Only save if the cartState currently in memory belongs to the current user.
        // This prevents overwriting a new user's cart with the previous user's data 
        // during the render cycle where the user has changed but the load effect hasn't run yet.
        if (cartState.userId === currentUserId) {
            const key = user ? `cart_${user._id}` : 'cart';
            localStorage.setItem(key, JSON.stringify(cartState.items));
        }
    }, [cartState, user]);

    const addToCart = (product) => {
        setCartState(prev => {
            const existingItem = prev.items.find(item => item._id === product._id);
            let newItems;

            if (existingItem) {
                success(`Updated quantity for ${product.name}`);
                newItems = prev.items.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                success(`${product.name} added to cart!`);
                newItems = [...prev.items, { ...product, quantity: 1 }];
            }

            return { ...prev, items: newItems };
        });
    };

    const removeFromCart = (productId) => {
        setCartState(prev => ({
            ...prev,
            items: prev.items.filter(item => item._id !== productId)
        }));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartState(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
        }));
    };

    const clearCart = () => {
        setCartState(prev => ({ ...prev, items: [] }));
    };

    const getCartCount = () => {
        return cartState.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems: cartState.items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartCount,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
