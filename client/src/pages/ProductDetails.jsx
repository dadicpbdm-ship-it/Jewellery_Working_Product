import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import ImageGallery from '../components/ImageGallery';
import ProductReviews from '../components/ProductReviews';
import Breadcrumbs from '../components/Breadcrumbs';
import EMICalculator from '../components/EMICalculator';
import ARTryOn from '../components/ARTryOn';
import TryAtHomeModal from '../components/TryAtHomeModal';
import AlertModal from '../components/AlertModal';
import ProductRecommendations from '../components/ProductRecommendations';
import CustomizationModal from '../components/CustomizationModal';
import RelatedProducts from '../components/RelatedProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import { API_URL } from '../config';
import './ProductDetails.css';

import { AuthContext } from '../context/AuthContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pincode, setPincode] = useState('');
    const [checkResult, setCheckResult] = useState(null);
    const [checkLoading, setCheckLoading] = useState(false);
    const [showTryAtHomeModal, setShowTryAtHomeModal] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, type: null });
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);
    const [customizationData, setCustomizationData] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products/${id}`);
                if (!response.ok) throw new Error('Product not found');
                const data = await response.json();
                setProduct(data);

                // Track recently viewed products
                const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const filtered = recentlyViewed.filter(p => p._id !== data._id);
                const updated = [{ _id: data._id, name: data.name, imageUrl: data.imageUrl, price: data.price }, ...filtered].slice(0, 6);
                localStorage.setItem('recentlyViewed', JSON.stringify(updated));

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to load product details. Please try again later.');
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Fetch related products logic removed - handled by backend

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
        }
    };

    const handleBuyNow = () => {
        if (product) {
            addToCart(product);
            navigate('/cart');
        }
    };

    const handleWishlistClick = () => {
        if (product) {
            if (isInWishlist(product._id)) {
                removeFromWishlist(product._id);
            } else {
                addToWishlist(product._id);
            }
        }
    }


    const checkAvailability = async () => {
        if (pincode.length !== 6) return;

        setCheckLoading(true);
        setCheckResult(null);

        try {
            // Pass productId to check stock availability at the specific location
            const response = await fetch(`${API_URL}/api/pincodes/check/${pincode}?productId=${product._id}`);
            const data = await response.json();

            if (response.ok && data.serviceable) {
                // Check if product is in stock at this location (if backend returns this info)
                if (data.inStock === false) {
                    setCheckResult({
                        serviceable: false, // Treat as not serviceable for this product
                        message: data.stockMessage || 'Currently out of stock at this location.',
                        isStockIssue: true
                    });
                } else {
                    const date = new Date();
                    date.setDate(date.getDate() + (data.deliveryDays || 5));
                    setCheckResult({
                        serviceable: true,
                        message: `Delivery available to ${data.city}, ${data.state} by ${date.toDateString()}${data.codAvailable ? ' (COD Available)' : ''}`
                    });
                }
            } else {
                setCheckResult({
                    serviceable: false,
                    message: data.message || 'Sorry, delivery not available to this pincode.'
                });
            }
        } catch (error) {
            console.error('Error checking pincode:', error);
            setCheckResult({
                serviceable: false,
                message: 'Error checking availability. Please try again.'
            });
        } finally {
            setCheckLoading(false);
        }
    };

    if (loading) return <div className="container loading-text">Loading details...</div>;
    if (error) return (
        <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: 'red' }}>Error</h2>
            <p>{error}</p>
            <Link to="/shop" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Shop</Link>
        </div>
    );
    if (!product) return <div className="container loading-text">Product not found</div>;

    const isWishlisted = isInWishlist(product._id);

    return (
        <div className="product-details-page container">
            <Breadcrumbs productName={product.name} />
            <div className="details-grid">
                <div className="details-left-column">
                    {/* Image Gallery with Zoom */}
                    <ImageGallery
                        images={product.images || [product.imageUrl]}
                        productName={product.name}
                    />
                    {/* Price Breakup */}
                    <div className="price-breakup">
                        <div className="breakup-toggle">
                            <span>Price Breakup</span>
                            <span className="info-icon" title="Estimated breakdown">ⓘ</span>
                        </div>
                        <div className="breakup-table">
                            <div className="breakup-row">
                                <span>Metal Value (approx.)</span>
                                <span>₹{Math.round(product.price * 0.87).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="breakup-row">
                                <span>Making Charges (10%)</span>
                                <span>₹{Math.round(product.price * 0.10).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="breakup-row">
                                <span>GST (3%)</span>
                                <span>₹{Math.round(product.price * 0.03).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="breakup-row total">
                                <span>Total</span>
                                <span>₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details-info">
                    <span className="details-category">{product.category}</span>
                    <h1>{product.name}</h1>
                    <div className="details-rating">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                        <span>({product.rating}) · {product.numReviews || 0} reviews</span>
                    </div>
                    <p className="details-price">₹{product.price.toLocaleString('en-IN')}</p>

                    {/* EMI Calculator */}
                    <EMICalculator price={product.price} />

                    {/* Stock Status */}
                    {product.stock !== undefined && (
                        <div className="stock-status">
                            {product.stock > 10 ? (
                                <span className="in-stock">✓ In Stock</span>
                            ) : product.stock > 0 ? (
                                <span className="low-stock">⚠ Only {product.stock} left!</span>
                            ) : (
                                <span className="out-of-stock">✗ Out of Stock</span>
                            )}
                        </div>
                    )}

                    {/* Product Specifications */}
                    <div className="product-specifications">
                        <h3>Product Details</h3>
                        <div className="specs-grid">
                            {product.material && (
                                <div className="spec-item">
                                    <span className="spec-label">Material</span>
                                    <span className="spec-value">{product.material}</span>
                                </div>
                            )}
                            {product.occasion && (
                                <div className="spec-item">
                                    <span className="spec-label">Occasion</span>
                                    <span className="spec-value">{product.occasion}</span>
                                </div>
                            )}
                            {product.style && (
                                <div className="spec-item">
                                    <span className="spec-label">Style</span>
                                    <span className="spec-value">{product.style}</span>
                                </div>
                            )}
                            {product.category && (
                                <div className="spec-item">
                                    <span className="spec-label">Category</span>
                                    <span className="spec-value">{product.category}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pincode Checker */}
                    <div className="pincode-checker">
                        <label>Check Delivery Availability</label>
                        <div className="pincode-input-group">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                maxLength="6"
                                value={pincode}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val)) setPincode(val);
                                    setCheckResult(null); // Reset result on change
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && pincode.length === 6) {
                                        checkAvailability();
                                    }
                                }}
                                disabled={checkLoading}
                            />
                            <button
                                onClick={checkAvailability}
                                disabled={checkLoading || pincode.length !== 6}
                            >
                                {checkLoading ? 'Checking...' : 'Check'}
                            </button>
                        </div>
                        {checkResult && (
                            <p className={`pincode-msg ${checkResult.serviceable ? 'success' : 'error'}`}>
                                {checkResult.message}
                            </p>
                        )}
                        {!checkResult?.serviceable && !checkResult && (
                            <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '5px' }}>
                                ⚠️ Please check delivery availability to proceed
                            </p>
                        )}
                    </div>



                    {/* Share Button */}
                    <div className="social-sharing" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            className="btn-share-all"
                            onClick={async () => {
                                if (navigator.share) {
                                    try {
                                        await navigator.share({
                                            title: product.name,
                                            text: `Check out this ${product.name} - ₹${product.price.toLocaleString('en-IN')}`,
                                            url: window.location.href,
                                        });
                                    } catch (error) {
                                        console.log('Error sharing:', error);
                                    }
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            title="Share"
                            style={{
                                background: 'none',
                                border: '1px solid #ddd',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#555',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Share this product</span>
                    </div>

                    {/* Customization Summary */}
                    {customizationData && (
                        <div className="customization-summary" style={{
                            background: '#f0f8ff',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            border: '1px solid #b3d9ff'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>✨ Your Customization</h4>
                            {customizationData.engraving?.text && (
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Engraving:</strong> "{customizationData.engraving.text}" ({customizationData.engraving.font})
                                </p>
                            )}
                            {customizationData.selectedSize && (
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Size:</strong> {customizationData.selectedSize}
                                </p>
                            )}
                            {customizationData.selectedMaterial !== product.material && (
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Material:</strong> {customizationData.selectedMaterial}
                                </p>
                            )}
                            <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#0066cc' }}>
                                Total: ₹{customizationData.totalPrice.toLocaleString('en-IN')}
                            </p>
                        </div>
                    )}

                    <div className="details-actions">
                        {/* Customize Button */}
                        {product.customizationOptions && (
                            product.customizationOptions.allowEngraving ||
                            product.customizationOptions.availableSizes?.length > 0 ||
                            product.customizationOptions.materialVariants?.length > 0
                        ) && (
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowCustomizationModal(true)}
                                    title={"Customize this product"}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    ✨ Customize
                                </button>
                            )}

                        <button
                            className="btn-primary"
                            onClick={() => {
                                if (customizationData) {
                                    addToCart({ ...product, customization: customizationData });
                                } else {
                                    addToCart(product);
                                }
                            }}
                            // disabled={!checkResult?.serviceable} // User Request: Allow adding to cart for future
                            title={"Add to Cart"}
                        // style={{ opacity: !checkResult?.serviceable ? 0.6 : 1 }}
                        >
                            Add to Cart
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={handleBuyNow}
                            // disabled={!checkResult?.serviceable} // User Request: Allow buying even if check fails (user will be blocked at checkout anyway if address invalid)
                            title={"Buy Now"}
                        // style={{ opacity: !checkResult?.serviceable ? 0.6 : 1 }}
                        >
                            Buy Now
                        </button>

                        <button
                            className="btn-try-at-home"
                            onClick={() => setShowTryAtHomeModal(true)}
                            disabled={!checkResult?.serviceable}
                            style={{
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(37, 117, 252, 0.2)',
                                opacity: !checkResult?.serviceable ? 0.6 : 1
                            }}
                        >
                            🏠 Try at Home
                        </button>



                        {/* Notification Button - Handles Price, Stock, and Availability Alerts */}
                        {(() => {
                            // Determine button type and action based on state priority
                            let alertType = 'price';
                            let btnLabel = '🔔 Price Alert';
                            let btnStyle = { display: 'flex', alignItems: 'center', gap: '5px' };
                            let btnClass = 'btn-secondary';

                            if (checkResult && !checkResult.serviceable) {
                                alertType = 'availability';
                                btnLabel = '🔔 Notify Me When Available';
                                btnClass = 'btn-primary';
                                btnStyle = { ...btnStyle, background: '#ff9800', width: '100%', justifyContent: 'center' };
                            } else if (product.countInStock === 0) {
                                alertType = 'stock';
                                btnLabel = '🔔 Notify Me When In Stock';
                                btnClass = 'btn-primary';
                                btnStyle = { ...btnStyle, background: '#ff9800' };
                            }

                            return (
                                <button
                                    className={btnClass}
                                    onClick={() => setAlertModal({ show: true, type: alertType })}
                                    style={btnStyle}
                                >
                                    {btnLabel}
                                </button>
                            );
                        })()}

                        <ARTryOn productName={product.name} productImage={product.imageUrl} />
                        <button
                            className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                            onClick={handleWishlistClick}
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill={isWishlisted ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="details-meta">
                        <p><strong>SKU:</strong> JWL-{product._id.slice(-6)}</p>
                        <p><strong>Availability:</strong> In Stock</p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <ProductReviews productId={product._id} />

            {/* Related Products Section */}
            <RelatedProducts products={product.relatedProducts} />

            {/* Recently Viewed Section */}
            <RecentlyViewed />

            {/* Try At Home Modal */}
            {showTryAtHomeModal && (
                <TryAtHomeModal
                    product={product}
                    onClose={() => setShowTryAtHomeModal(false)}
                />
            )}

            {/* Alert Modal */}
            {alertModal.show && (
                <AlertModal
                    product={product}
                    type={alertModal.type}
                    user={user}
                    pincode={pincode} // Pass checked pincode to modal
                    onClose={() => setAlertModal({ show: false, type: null })}
                />
            )}

            {/* Customization Modal */}
            {showCustomizationModal && (
                <CustomizationModal
                    product={product}
                    onClose={() => setShowCustomizationModal(false)}
                    onCustomize={(data) => setCustomizationData(data)}
                />
            )}
        </div>
    );
};

export default ProductDetails;
