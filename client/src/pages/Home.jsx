import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../config';
import './Home.css';
import './BannerEnhancement.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                // Handle both array response and paginated object response
                const productList = Array.isArray(data) ? data : (data.products || []);
                setProducts(productList.filter(p => p.isFeatured));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load featured products. Please try again later.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Timeless Elegance, <br /> Crafted for You</h1>
                    <p>Discover our exclusive collection of authentic Indian Jewellery.</p>
                    <Link to="/shop" className="btn-primary">Shop Collection</Link>
                </div>
            </section>

            {/* Shop By Category Section */}
            <section className="category-section container">
                <h2 className="section-title">Shop By Category</h2>
                <div className="category-grid">
                    <Link to="/shop?material=Gold" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80" alt="Gold Jewellery" />
                        </div>
                        <h3>Gold Jewellery</h3>
                    </Link>
                    <Link to="/shop?material=Diamond" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=300&q=80" alt="Diamond Jewellery" />
                        </div>
                        <h3>Diamond Jewellery</h3>
                    </Link>
                    <Link to="/shop?category=Earrings" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80" alt="Earrings" />
                        </div>
                        <h3>Earrings</h3>
                    </Link>
                    <Link to="/shop?category=Rings" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80" alt="Rings" />
                        </div>
                        <h3>Rings</h3>
                    </Link>
                    <Link to="/shop?category=Necklaces" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=300&q=80" alt="Necklaces" />
                        </div>
                        <h3>Necklaces</h3>
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section container">
                <h2 className="section-title">Featured Collection</h2>
                {loading ? (
                    <p className="loading-text">Loading exquisite pieces...</p>
                ) : error ? (
                    <div className="error-message" style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
                        <p>{error}</p>
                    </div>
                ) : products.length === 0 ? (
                    <p className="no-products-text" style={{ textAlign: 'center', padding: '20px' }}>No featured products available at the moment.</p>
                ) : (
                    <div className="product-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Categories / Banner */}
            <section className="banner-section">
                <div className="container">
                    <div className="banner-content">
                        <h2>Custom Designs Available</h2>
                        <p>Bring your dream jewellery to life with our bespoke services.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/custom-designer" className="btn-primary">Design Your Own</Link>
                            <Link to="/contact" className="btn-primary" style={{ background: '#2c3e50' }}>Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Signals Section */}
            <section className="trust-section">
                <div className="container">
                    <div className="trust-grid">
                        <div className="trust-item">
                            <div className="trust-icon">🏆</div>
                            <h4>Purity Guarantee</h4>
                            <p>Certified Hallmarked Gold</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">🛡️</div>
                            <h4>Secure Shipping</h4>
                            <p>Insured & Safe Delivery</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">↩️</div>
                            <h4>Easy Returns</h4>
                            <p>7-Day Return Policy</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">💎</div>
                            <h4>Transparent Pricing</h4>
                            <p>No Hidden Charges</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
