import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import Preview3D from '../components/designer/Preview3D';
import DesignGallery from '../components/designer/DesignGallery';
import BudgetHelper from '../components/designer/BudgetHelper';
import LoadingSpinner from '../components/LoadingSpinner';
import './CustomDesigner.css';

const CustomDesigner = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Design Templates
    const DESIGN_TEMPLATES = [
        { name: 'Classic Solitaire', metal: 'Gold', gemstone: 'Diamond', gemstoneSize: 1.0, size: 10, icon: '💍' },
        { name: 'Vintage Halo', metal: 'Rose Gold', gemstone: 'Ruby', gemstoneSize: 1.5, size: 10, icon: '👑' },
        { name: 'Modern Minimalist', metal: 'White Gold', gemstone: 'None', gemstoneSize: 0.5, size: 10, icon: '✨' },
        { name: 'Royal Statement', metal: 'Platinum', gemstone: 'Sapphire', gemstoneSize: 2.0, size: 10, icon: '💎' },
        { name: 'Everyday Elegance', metal: 'Silver', gemstone: 'Emerald', gemstoneSize: 0.8, size: 10, icon: '🌟' }
    ];

    // Occasion Filters
    const OCCASIONS = ['All', 'Wedding', 'Engagement', 'Anniversary', 'Birthday', 'Self-Gift'];

    const [design, setDesign] = useState({
        type: 'Ring',
        metal: 'Gold',
        gemstone: 'Diamond',
        gemstoneSize: 1.0,
        size: 10,
        engravingText: ''
    });

    const [saving, setSaving] = useState(false);
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [selectedOccasion, setSelectedOccasion] = useState('All');
    const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [budgetLimit, setBudgetLimit] = useState(50000);
    const [showEngravingPreview, setShowEngravingPreview] = useState(false);

    // Pricing Constants
    const PRICES = {
        metal: {
            'Gold': 5000,
            'Rose Gold': 5200,
            'White Gold': 5500,
            'Platinum': 8000,
            'Silver': 1000
        },
        gemstone: {
            'Diamond': 20000,
            'Ruby': 15000,
            'Sapphire': 12000,
            'Emerald': 10000,
            'None': 0
        }
    };

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (user) {
            fetchSavedDesigns();
        }
    }, [user]);

    const fetchSavedDesigns = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/api/custom-designs/my-designs`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSavedDesigns(data);
            }
        } catch (error) {
            console.error('Error fetching saved designs:', error);
        }
    };

    const calculatePrice = () => {
        let price = PRICES.metal[design.metal] * 4; // Base weight approx 4g
        if (design.gemstone !== 'None') {
            price += PRICES.gemstone[design.gemstone] * design.gemstoneSize;
        }
        return price;
    };

    const getPriceBreakdown = () => {
        const metalCost = PRICES.metal[design.metal] * 4;
        const gemstoneCost = design.gemstone !== 'None' ? PRICES.gemstone[design.gemstone] * design.gemstoneSize : 0;
        const makingCharges = metalCost * 0.15;
        const gst = (metalCost + gemstoneCost + makingCharges) * 0.03;

        return {
            metal: metalCost,
            gemstone: gemstoneCost,
            making: makingCharges,
            gst: gst,
            total: metalCost + gemstoneCost + makingCharges + gst
        };
    };

    const totalPrice = calculatePrice();
    const breakdown = getPriceBreakdown();

    const applyTemplate = (template) => {
        setDesign({
            ...design,
            metal: template.metal,
            gemstone: template.gemstone,
            gemstoneSize: template.gemstoneSize,
            size: template.size
        });
    };

    const handleGalleryDesignSelect = (galleryDesign) => {
        setDesign({
            ...design,
            metal: galleryDesign.metal,
            gemstone: galleryDesign.gemstone,
            gemstoneSize: galleryDesign.gemstoneSize,
            size: galleryDesign.size
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveDesign = async () => {
        if (!user) {
            alert('Please login to save your design');
            navigate('/login');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`${API_URL}/api/custom-designs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...design,
                    name: `${design.metal} ${design.type} with ${design.gemstone}`,
                    estimatedPrice: totalPrice
                })
            });

            if (response.ok) {
                const savedDesign = await response.json();
                alert('Design saved successfully!');
                fetchSavedDesigns();
                addToCart({
                    _id: savedDesign._id,
                    name: savedDesign.name,
                    price: savedDesign.estimatedPrice,
                    imageUrl: 'https://via.placeholder.com/150?text=Custom+Design',
                    isCustom: true
                });
                navigate('/cart');
            } else {
                throw new Error('Failed to save design');
            }
        } catch (error) {
            console.error('Error saving design:', error);
            alert('Error saving design');
        } finally {
            setSaving(false);
        }
    };

    const shareDesign = (platform) => {
        const designText = `Check out my custom ${design.metal} ${design.type} with ${design.gemstone}! Only ₹${totalPrice.toLocaleString('en-IN')}`;
        const url = window.location.href;

        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(designText + ' ' + url)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
        setShowShareModal(false);
    };

    return (
        <div className="custom-designer-page">
            <div className="designer-container">
                {/* Promotional Banner */}
                <div className="designer-promo-bar">
                    🎉 Limited Time: Design Today & Get 10% Off Your Custom Order! 🎉
                </div>

                {/* Hero Section */}
                <div className="designer-hero">
                    <h1>Design Your Dream Jewellery</h1>
                    <p>Create unique pieces in 3 easy steps</p>
                </div>

                {/* Occasion Filters */}
                <div className="occasion-filters">
                    {OCCASIONS.map(occasion => (
                        <button
                            key={occasion}
                            className={`occasion-btn ${selectedOccasion === occasion ? 'active' : ''}`}
                            onClick={() => setSelectedOccasion(occasion)}
                        >
                            {occasion}
                        </button>
                    ))}
                </div>

                {/* Design Templates */}
                <div className="templates-section">
                    <h2>Start with a Template</h2>
                    <div className="template-grid">
                        {DESIGN_TEMPLATES.map((template, idx) => (
                            <div
                                key={idx}
                                className="template-card"
                                onClick={() => applyTemplate(template)}
                            >
                                <div className="template-icon">{template.icon}</div>
                                <h4>{template.name}</h4>
                                <p>
                                    {template.metal} • {template.gemstone}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Budget Helper */}
                <BudgetHelper onBudgetChange={setBudgetLimit} />

                <div className="designer-main-grid">
                    {/* 3D Preview Section */}
                    <div className="preview-section">
                        <Preview3D
                            type={design.type}
                            metal={design.metal}
                            gemstone={design.gemstone}
                            gemstoneSize={design.gemstoneSize}
                        />
                        <p className="preview-instruction">
                            Interactive 3D Preview • Drag to Rotate • Scroll to Zoom
                        </p>
                    </div>

                    {/* Customization Controls */}
                    <div className="designer-controls">
                        <div className="control-group">
                            <label className="control-label">Jewellery Type</label>
                            <select
                                className="control-select"
                                value={design.type}
                                onChange={(e) => setDesign({ ...design, type: e.target.value })}
                            >
                                <option value="Ring">💍 Ring</option>
                                <option value="Necklace">📿 Necklace</option>
                                <option value="Earrings">💎 Earrings</option>
                                <option value="Bracelet">⌚ Bracelet</option>
                            </select>
                        </div>

                        <div className="control-group">
                            <label className="control-label">Metal</label>
                            <select
                                className="control-select"
                                value={design.metal}
                                onChange={(e) => setDesign({ ...design, metal: e.target.value })}
                            >
                                {Object.keys(PRICES.metal).map(m => (
                                    <option key={m} value={m}>{m} (₹{PRICES.metal[m]}/g)</option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label className="control-label">Gemstone</label>
                            <select
                                className="control-select"
                                value={design.gemstone}
                                onChange={(e) => setDesign({ ...design, gemstone: e.target.value })}
                            >
                                {Object.keys(PRICES.gemstone).map(g => (
                                    <option key={g} value={g}>
                                        {g} {g !== 'None' && `(₹${(PRICES.gemstone[g] / 1000).toFixed(0)}K/ct)`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {design.gemstone !== 'None' && (
                            <div className="control-group">
                                <label className="control-label">Gemstone Size (Carat): {design.gemstoneSize}</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={design.gemstoneSize}
                                    onChange={(e) => setDesign({ ...design, gemstoneSize: parseFloat(e.target.value) })}
                                    className="range-input"
                                />
                            </div>
                        )}

                        <div className="control-group">
                            <label className="control-label">Ring Size</label>
                            <select
                                className="control-select"
                                value={design.size}
                                onChange={(e) => setDesign({ ...design, size: parseInt(e.target.value) })}
                            >
                                {[...Array(15)].map((_, i) => (
                                    <option key={i} value={i + 6}>Size {i + 6}</option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label className="control-label">Engraving (Optional - Max 20 chars)</label>
                            <input
                                type="text"
                                className="control-select"
                                placeholder="Enter text to engrave..."
                                maxLength="20"
                                value={design.engravingText}
                                onChange={(e) => setDesign({ ...design, engravingText: e.target.value })}
                            />
                            <small className="char-count">{design.engravingText.length}/20 characters</small>
                            {design.engravingText && (
                                <div className="engraving-preview-box">
                                    <div className="preview-label">
                                        ✨ Engraving Preview
                                    </div>
                                    <div className="preview-text">
                                        "{design.engravingText}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Section with Breakdown */}
                        <div className="designer-price-section">
                            <div className="price-tag">
                                ₹{totalPrice.toLocaleString('en-IN')}
                                <span
                                    className="info-icon"
                                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                >
                                    ℹ️ Price Breakdown
                                </span>
                            </div>

                            {showPriceBreakdown && (
                                <div className="price-breakdown">
                                    <div className="breakdown-row">
                                        <span>Metal Cost (4g):</span>
                                        <span>₹{breakdown.metal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {breakdown.gemstone > 0 && (
                                        <div className="breakdown-row">
                                            <span>Gemstone ({design.gemstoneSize}ct):</span>
                                            <span>₹{breakdown.gemstone.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="breakdown-row">
                                        <span>Making Charges (15%):</span>
                                        <span>₹{breakdown.making.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>GST (3%):</span>
                                        <span>₹{breakdown.gst.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="breakdown-row total-row">
                                        <span>Total:</span>
                                        <span>₹{breakdown.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="designer-button-group">
                            <button
                                className="designer-btn primary-btn"
                                onClick={handleSaveDesign}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : '🛒 Add to Cart'}
                            </button>
                            <button
                                className="designer-btn secondary-btn"
                                onClick={() => setShowShareModal(true)}
                            >
                                📤 Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saved Designs Section */}
                {savedDesigns.length > 0 && (
                    <div className="saved-designs-section">
                        <h2>Your Saved Designs ({savedDesigns.length})</h2>
                        <div className="saved-designs-grid">
                            {savedDesigns.slice(0, 4).map(saved => (
                                <div key={saved._id} className="saved-design-card">
                                    <h4>{saved.name}</h4>
                                    <p>
                                        {saved.metal} • {saved.gemstone}
                                    </p>
                                    <p className="saved-price">
                                        ₹{saved.estimatedPrice.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Design Gallery */}
                <DesignGallery onSelectDesign={handleGalleryDesignSelect} />
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="designer-modal" onClick={() => setShowShareModal(false)}>
                    <div className="designer-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Share Your Design</h3>
                        <p>Let your friends see your amazing creation!</p>
                        <div className="share-buttons">
                            <button
                                className="designer-btn share-whatsapp"
                                onClick={() => shareDesign('whatsapp')}
                            >
                                WhatsApp
                            </button>
                            <button
                                className="designer-btn share-facebook"
                                onClick={() => shareDesign('facebook')}
                            >
                                Facebook
                            </button>
                        </div>
                        <button
                            className="designer-btn secondary-btn close-btn"
                            onClick={() => setShowShareModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDesigner;
