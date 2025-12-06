import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { RewardsContext } from '../context/RewardsContext';
import { API_URL } from '../config';
import BNPLOption from '../components/BNPLOption';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useContext(AuthContext);
    const { balance: rewardBalance } = useContext(RewardsContext);
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

    // Gifting State
    const [giftDetails, setGiftDetails] = useState({
        isGift: false,
        wrappingPaper: 'Gold', // Default to premium
        message: '',
        hidePrice: true
    });

    // Reward Points State - now using RewardsContext balance
    const [pointsToUse, setPointsToUse] = useState(0);
    const [pointsDiscount, setPointsDiscount] = useState(0);

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

    const validatePincode = async (pincode) => {
        try {
            const response = await fetch(`${API_URL}/api/pincodes/check/${pincode}`);
            const data = await response.json();
            if (response.ok && data.serviceable) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error validating pincode:', error);
            return false; // Fail safe
        }
    };

    const handlePointsChange = (points) => {
        const numPoints = parseInt(points) || 0;

        // Ensure points don't exceed available balance
        const validPoints = Math.min(numPoints, rewardBalance);

        // Calculate discount (100 points = ₹10)
        const discount = Math.floor(validPoints / 100) * 10;

        setPointsToUse(validPoints);
        setPointsDiscount(discount);
    };

    const getFinalAmount = () => {
        return Math.max(0, getCartTotal() - pointsDiscount);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            alert('Please fill in all shipping address fields');
            return;
        }

        // Pincode Validation
        const isServiceable = await validatePincode(shippingAddress.postalCode);
        if (!isServiceable) {
            alert('Sorry, we do not deliver to this pincode yet. Please try another address.');
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
                body: JSON.stringify({
                    amount: totalAmount,
                    pointsDiscount: pointsDiscount
                })
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

            // If fully paid by points, skip Razorpay and place order directly
            if (orderData.fullyPaidByPoints) {
                console.log('Order fully paid by reward points');
                await placeOrder(true, {
                    id: 'points_payment',
                    status: 'completed',
                    method: 'reward_points'
                });
                return;
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
                rewardPointsUsed: pointsToUse > 0 ? {
                    points: pointsToUse,
                    discountAmount: pointsDiscount
                } : undefined,
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
                } : undefined,
                giftDetails: giftDetails.isGift ? giftDetails : undefined
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

                    {/* Premium Gifting Section */}
                    <div className="gifting-section" style={{
                        background: '#fffdf5',
                        border: '1px solid #c9a961',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🎁</span>
                            <h3 style={{ margin: 0, color: '#333' }}>Send as a Gift?</h3>
                            <label className="switch" style={{ marginLeft: 'auto' }}>
                                <input
                                    type="checkbox"
                                    checked={giftDetails.isGift}
                                    onChange={(e) => setGiftDetails({ ...giftDetails, isGift: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        {giftDetails.isGift && (
                            <div className="gift-options" style={{ animation: 'slideDown 0.3s ease-out' }}>
                                <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', color: '#666' }}>Select Wrapping</h4>
                                <div className="wrapping-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {[
                                        { id: 'Gold', name: 'Royal Gold', color: '#C9A961', desc: 'Premium velvet finish' },
                                        { id: 'Silver', name: 'Sterling Silver', color: '#C0C0C0', desc: 'Classic elegance' },
                                        { id: 'Classic', name: 'Signature Box', color: '#333', desc: 'Standard packaging' }
                                    ].map(wrap => (
                                        <div
                                            key={wrap.id}
                                            onClick={() => setGiftDetails({ ...giftDetails, wrappingPaper: wrap.id })}
                                            style={{
                                                border: giftDetails.wrappingPaper === wrap.id ? `2px solid ${wrap.color}` : '1px solid #eee',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                cursor: 'pointer',
                                                background: '#fff',
                                                textAlign: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: wrap.color, margin: '0 auto 5px' }}></div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{wrap.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{wrap.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', color: '#666' }}>Personal Message</h4>
                                <textarea
                                    placeholder="Type your message here... (We'll print it on a card)"
                                    value={giftDetails.message}
                                    onChange={(e) => setGiftDetails({ ...giftDetails, message: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        minHeight: '80px',
                                        fontFamily: 'inherit'
                                    }}
                                />

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.9rem', color: '#555', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={giftDetails.hidePrice}
                                        onChange={(e) => setGiftDetails({ ...giftDetails, hidePrice: e.target.checked })}
                                    />
                                    Hide price on invoice
                                </label>
                            </div>
                        )}
                    </div>

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

                        {/* Reward Points Section */}
                        {user && (
                            <div className="reward-points-section" style={{
                                background: 'white',
                                border: '2px solid #eee',
                                borderRadius: '8px',
                                padding: '1.25rem',
                                marginBottom: '25px',
                                color: '#2c3e50',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = '#c9a961';
                                    e.currentTarget.style.background = '#fffdf5';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = '#eee';
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50' }}>💎 Reward Points</h3>
                                    <span style={{
                                        background: '#f0f0f0',
                                        color: '#2c3e50',
                                        padding: '4px 12px',
                                        borderRadius: '15px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        {rewardBalance.toLocaleString()} pts
                                    </span>
                                </div>

                                {rewardBalance >= 100 ? (
                                    <>
                                        <div style={{
                                            background: '#f8f9fa',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginBottom: '10px',
                                            border: '1px solid #eee'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Select points:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePointsChange(rewardBalance)}
                                                    style={{
                                                        padding: '5px 12px',
                                                        background: '#c9a961',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#b8984f'}
                                                    onMouseOut={(e) => e.target.style.background = '#c9a961'}
                                                >
                                                    Use All
                                                </button>
                                            </div>

                                            <input
                                                type="range"
                                                min="0"
                                                max={rewardBalance}
                                                step="100"
                                                value={pointsToUse}
                                                onChange={(e) => handlePointsChange(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    height: '6px',
                                                    borderRadius: '3px',
                                                    outline: 'none',
                                                    marginBottom: '6px',
                                                    accentColor: '#c9a961'
                                                }}
                                            />

                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                                                <span>0</span>
                                                <span style={{ color: '#c9a961', fontWeight: '600' }}>{pointsToUse} pts</span>
                                                <span>{rewardBalance}</span>
                                            </div>
                                        </div>

                                        {pointsToUse >= 100 && (
                                            <div style={{
                                                background: '#fffdf5',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                border: '1px solid #c9a961'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#666' }}>Discount:</span>
                                                    <span style={{ fontWeight: '600', color: '#c9a961' }}>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                                                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>You Pay:</span>
                                                    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: getFinalAmount() === 0 ? '#c9a961' : '#2c3e50' }}>
                                                        ₹{getFinalAmount().toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                {getFinalAmount() === 0 && (
                                                    <p style={{
                                                        margin: '8px 0 0 0',
                                                        color: '#c9a961',
                                                        fontSize: '0.8rem',
                                                        textAlign: 'center',
                                                        fontWeight: '600'
                                                    }}>
                                                        ✨ Fully covered!
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {pointsToUse > 0 && pointsToUse < 100 && (
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#e74c3c', textAlign: 'center' }}>
                                                ⚠️ Minimum 100 points required
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div style={{
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        textAlign: 'center',
                                        border: '1px solid #eee'
                                    }}>
                                        {rewardBalance === 0 ? (
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                                Start shopping to earn points!<br />
                                                <small style={{ color: '#999' }}>1 point = ₹1 spent</small>
                                            </p>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                                Need {100 - rewardBalance} more points<br />
                                                <small style={{ color: '#999' }}>Minimum 100 required</small>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

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
                            {pointsDiscount > 0 && (
                                <div className="summary-row discount">
                                    <span>Reward Points Discount</span>
                                    <span className="discount-amount">-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{getFinalAmount().toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
