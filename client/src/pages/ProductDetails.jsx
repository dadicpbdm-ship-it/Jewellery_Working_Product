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
            const response = await fetch(`${API_URL}/api/pincodes/check/${pincode}`);
            const data = await response.json();

            if (response.ok && data.serviceable) {
                const date = new Date();
                date.setDate(date.getDate() + (data.deliveryDays || 5));
                setCheckResult({
                    serviceable: true,
                    message: `Delivery available to ${data.city}, ${data.state} by ${date.toDateString()}${data.codAvailable ? ' (COD Available)' : ''}`
                });
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
                    </div>

                    <p className="details-description">{product.description}</p>

                    {/* Social Sharing */}
                    <div className="social-sharing">
                        <span className="share-label">Share:</span>
                        <button
                            className="share-btn whatsapp"
                            onClick={() => {
                                const url = window.location.href;
                                const text = `Check out this ${product.name} - ₹${product.price.toLocaleString('en-IN')}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                            }}
                            title="Share on WhatsApp"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </button>
                        <button
                            className="share-btn facebook"
                            onClick={() => {
                                const url = window.location.href;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                            }}
                            title="Share on Facebook"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </button>
                        <button
                            className="share-btn pinterest"
                            onClick={() => {
                                const url = window.location.href;
                                const media = product.imageUrl;
                                const description = product.name;
                                window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(description)}`, '_blank');
                            }}
                            title="Share on Pinterest"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                            </svg>
                        </button>
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
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    ✨ Customize
                                </button>
                            )}
                        <button className="btn-primary" onClick={() => {
                            if (customizationData) {
                                addToCart({ ...product, customization: customizationData });
                            } else {
                                addToCart(product);
                            }
                        }}>Add to Cart</button>
                        <button className="btn-secondary" onClick={handleBuyNow}>Buy Now</button>
                        <button
                            className="btn-try-at-home"
                            onClick={() => setShowTryAtHomeModal(true)}
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
                                boxShadow: '0 4px 15px rgba(37, 117, 252, 0.2)'
                            }}
                        >
                            🏠 Try at Home
                        </button>

                        {product.countInStock > 0 ? (
                            <button
                                className="btn-secondary"
                                onClick={() => setAlertModal({ show: true, type: 'price' })}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                🔔 Price Alert
                            </button>
                        ) : (
                            <button
                                className="btn-primary"
                                onClick={() => setAlertModal({ show: true, type: 'stock' })}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ff9800' }}
                            >
                                🔔 Notify Me
                            </button>
                        )}

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
