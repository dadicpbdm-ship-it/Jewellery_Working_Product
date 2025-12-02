import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import BNPLOption from '../components/BNPLOption';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [bnplProvider, setBnplProvider] = useState(null);

    const bnplProviders = [
        { name: 'Simpl', logo: 'simpl-logo', installments: 3 },
        { name: 'LazyPay', logo: 'lazypay-logo', installments: 3 },
        { name: 'ZestMoney', logo: 'zestmoney-logo', installments: 6 }
    ];

    useEffect(() => {
        if (user) {
            fetchSavedAddresses();
        } else {
            setLoadingAddresses(false);
        }
    }, [user]);

    const fetchSavedAddresses = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/addresses`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSavedAddresses(data);
                if (data.length > 0) {
                    // Automatically select the first address
                    selectAddress(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const selectAddress = (addr) => {
        setSelectedAddressId(addr._id);
        setShippingAddress({
            address: addr.address,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country
        });
    };

    const handleAddressSelection = (e) => {
        const id = e.target.value;
        setSelectedAddressId(id);

        if (id === 'new') {
            setShippingAddress({
                address: '',
                city: '',
                postalCode: '',
                country: ''
            });
        } else {
            const addr = savedAddresses.find(a => a._id === id);
            if (addr) {
                setShippingAddress({
                    address: addr.address,
                    city: addr.city,
                    postalCode: addr.postalCode,
                    country: addr.country
                });
            }
        }
    };

    const handleGuestInfoChange = (e) => {
        setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            alert('Please fill in all shipping address fields');
            return;
        }

        if (!user && (!guestInfo.name || !guestInfo.email || !guestInfo.phone)) {
            alert('Please fill in your contact information');
            return;
        }

        if (paymentMethod === 'Razorpay') {
            await processRazorpayPayment();
        } else if (paymentMethod === 'BNPL') {
            // Simulate BNPL flow
            if (!bnplProvider) {
                alert('Please select a BNPL provider');
                return;
            }
            // In a real app, we would redirect to provider's page
            const confirm = window.confirm(`Redirecting to ${bnplProvider}... Payment successful?`);
            if (confirm) {
                await placeOrder(true, {
                    id: `bnpl_${Date.now()}`,
                    status: 'completed',
                    provider: bnplProvider
                });
            }
        } else {
            await placeOrder();
        }
    };


    const processRazorpayPayment = async () => {
        // Check if Razorpay is loaded
        if (typeof window.Razorpay === 'undefined') {
            alert('Payment gateway is loading. Please try again in a moment.');
            console.error('Razorpay script not loaded');
            return;
        }

        const totalAmount = getCartTotal();

        try {
            // 0. Get Razorpay Key
            console.log('Fetching Razorpay key...');
            const keyResponse = await fetch(`${API_URL}/api/payment/get-key`, {
                method: 'GET'
            });

            console.log('Key response status:', keyResponse.status);

            if (!keyResponse.ok) {
                const errorData = await keyResponse.json();
                console.error('Get key failed:', errorData);
                throw new Error(errorData.message || 'Failed to get payment key');
            }

            const { key } = await keyResponse.json();
            console.log('Razorpay key received:', key ? 'Yes' : 'No');

            if (!key || key.includes('YOUR_KEY_ID')) {
                alert('Payment gateway is not configured. Please use Cash on Delivery or contact support.');
                return;
            }

            // 1. Create Order in Backend
            console.log('Creating Razorpay order...');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (user) {
                headers['Authorization'] = `Bearer ${user.token}`;
                console.log('User token added to headers');
            } else {
                console.log('No user - proceeding as guest');
            }

            const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ amount: totalAmount })
            });

            console.log('Create order response status:', orderResponse.status);

            const orderData = await orderResponse.json();
            console.log('Order data:', orderData);

            if (!orderResponse.ok) {
                if (orderData.code === 'KEYS_NOT_CONFIGURED') {
                    alert(orderData.message);
                    return;
                }
                throw new Error(orderData.message || 'Error creating order');
            }

            // 2. Open Razorpay Modal
            const options = {
                key: key,
                amount: orderData.amount,
                currency: "INR",
                name: "JewelIndia",
                description: "Purchase from JewelIndia",
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyHeaders = {
                            'Content-Type': 'application/json'
                        };
                        if (user) {
                            verifyHeaders['Authorization'] = `Bearer ${user.token}`;
                        }

                        const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
                            method: 'POST',
                            headers: verifyHeaders,
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyResponse.ok) {
                            // Payment verified, now place the order in our DB
                            await placeOrder(true, response);
                        } else {
                            alert('Payment verification failed: ' + verifyData.message);
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed. Please contact support with your payment ID.');
                    }
                },
                prefill: {
                    name: user ? user.name : guestInfo.name,
                    email: user ? user.email : guestInfo.email,
                    contact: user ? (user.phone || '') : guestInfo.phone
                },
                theme: {
                    color: "#c9a961"
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user');
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);

            rzp1.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                alert('Payment failed: ' + response.error.description);
            });

            rzp1.open();

        } catch (error) {
            console.error('Razorpay error:', error);
            alert('Payment error: ' + error.message);
        }
    };

    const placeOrder = async (isPaid = false, paymentResult = {}) => {
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    image: item.imageUrl || item.image,
                    price: item.price,
                    quantity: item.quantity
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice: getCartTotal(),
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: getCartTotal(),
                guestInfo: user ? undefined : guestInfo,
                isPaid,
                paidAt: isPaid ? new Date() : null,
                paymentResult: isPaid ? {
                    id: paymentResult.id || paymentResult.razorpay_payment_id,
                    status: 'completed',
                    update_time: new Date().toISOString(),
                    email_address: user ? user.email : guestInfo.email
                } : {},
                bnplDetails: paymentMethod === 'BNPL' ? {
                    provider: bnplProvider,
                    installments: bnplProviders.find(p => p.name === bnplProvider)?.installments || 3,
                    bnplStatus: 'completed'
                } : undefined
            };

            const headers = {
                'Content-Type': 'application/json'
            };

            if (user) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                clearCart();
                navigate('/order-success');
            } else {
                const errorData = await response.json();
                alert(`Order failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert(`Error placing order: ${error.message}`);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-container empty-cart-message">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/shop')}>Go to Shop</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Checkout</h1>
            <div className="checkout-grid">
                <div className="checkout-form-section">

                    {!user && (
                        <div className="form-group-section">
                            <h3>Contact Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={guestInfo.name}
                                        onChange={handleGuestInfoChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={guestInfo.email}
                                        onChange={handleGuestInfoChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={guestInfo.phone}
                                    onChange={handleGuestInfoChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {user && savedAddresses.length > 0 && (
                        <div className="saved-addresses-section">
                            <h3>Select Delivery Address</h3>
                            <div className="address-options">
                                {savedAddresses.map(addr => (
                                    <label key={addr._id} className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="addressSelection"
                                            value={addr._id}
                                            checked={selectedAddressId === addr._id}
                                            onChange={handleAddressSelection}
                                        />
                                        <div className="address-details">
                                            <strong>{addr.name}</strong>
                                            <p>{addr.address}, {addr.city}</p>
                                            <p>{addr.postalCode}, {addr.country}</p>
                                        </div>
                                    </label>
                                ))}
                                <label className={`address-card ${selectedAddressId === 'new' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="addressSelection"
                                        value="new"
                                        checked={selectedAddressId === 'new'}
                                        onChange={handleAddressSelection}
                                    />
                                    <div className="address-details">
                                        <strong>Add New Address</strong>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="checkout-form">
                        <h3>Shipping Address</h3>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                value={shippingAddress.address}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                required
                                disabled={selectedAddressId !== 'new'}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    required
                                    disabled={selectedAddressId !== 'new'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                    required
                                    disabled={selectedAddressId !== 'new'}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                type="text"
                                value={shippingAddress.country}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                required
                                disabled={selectedAddressId !== 'new'}
                            />
                        </div>

                        <h3>Payment Method</h3>
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span>
                                <div className="payment-details">
                                    <span className="payment-name">Cash on Delivery</span>
                                    <span className="payment-desc">Pay when you receive your order</span>
                                </div>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    value="Razorpay"
                                    checked={paymentMethod === 'Razorpay'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span>
                                <div className="payment-details">
                                    <span className="payment-name">Online Payment (Razorpay)</span>
                                    <span className="payment-desc">Pay securely using UPI, Cards, or NetBanking</span>
                                    <div className="payment-icons">
                                        <span>💳 Cards</span>
                                        <span>📱 UPI</span>
                                        <span>🏦 NetBanking</span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* BNPL Options */}
                        <div className="bnpl-section" style={{ marginTop: '20px' }}>
                            <label className={`payment-option ${paymentMethod === 'BNPL' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    value="BNPL"
                                    checked={paymentMethod === 'BNPL'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="radio-custom"></span>
                                <div className="payment-details">
                                    <span className="payment-name">Buy Now, Pay Later</span>
                                    <span className="payment-desc">Pay in interest-free installments</span>
                                </div>
                            </label>

                            {paymentMethod === 'BNPL' && (
                                <div className="bnpl-providers" style={{ marginLeft: '30px', marginTop: '15px' }}>
                                    {bnplProviders.map(provider => (
                                        <BNPLOption
                                            key={provider.name}
                                            provider={provider.name}
                                            installments={provider.installments}
                                            selected={bnplProvider === provider.name}
                                            onSelect={() => setBnplProvider(provider.name)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="place-order-btn">
                            Place Order
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-section">
                    <div className="order-summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            {cartItems.map((item) => (
                                <div key={item._id} className="summary-item">
                                    <div className="item-image">
                                        <img src={item.imageUrl || item.image} alt={item.name} />
                                        <span className="item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
