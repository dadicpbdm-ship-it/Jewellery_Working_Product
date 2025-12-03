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

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px'
        },
        hero: {
            textAlign: 'center',
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #C9A961 0%, #E5D4A6 100%)',
            padding: '40px 20px',
            borderRadius: '16px',
            color: '#0F1419'
        },
        promoBar: {
            background: '#28a745',
            color: 'white',
            padding: '12px',
            textAlign: 'center',
            borderRadius: '8px',
            marginBottom: '30px',
            fontWeight: '600',
            animation: 'pulse 2s infinite'
        },
        templatesSection: {
            marginBottom: '40px'
        },
        templateGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
        },
        templateCard: {
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px solid #e0e0e0',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        },
        occasionFilters: {
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        occasionBtn: {
            padding: '8px 20px',
            borderRadius: '20px',
            border: '2px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: '500'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
        },
        controls: {
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        },
        controlGroup: {
            marginBottom: '25px'
        },
        label: {
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: '#333'
        },
        select: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '1rem'
        },
        priceSection: {
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            position: 'relative'
        },
        priceTag: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#28a745',
            marginBottom: '10px'
        },
        infoIcon: {
            cursor: 'pointer',
            color: '#007bff',
            marginLeft: '10px',
            fontSize: '0.9rem'
        },
        breakdown: {
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '10px',
            fontSize: '0.9rem'
        },
        breakdownRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px'
        },
        button: {
            flex: 1,
            padding: '15px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
        },
        primaryBtn: {
            background: '#333',
            color: 'white'
        },
        secondaryBtn: {
            background: '#f0f0f0',
            color: '#333'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        },
        modalContent: {
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%'
        },
        shareButtons: {
            display: 'flex',
            gap: '10px',
            marginTop: '20px'
        }
    };

    return (
        <div className="custom-designer-page">
            <div style={styles.container}>
                {/* Promotional Banner */}
                <div style={styles.promoBar}>
                    🎉 Limited Time: Design Today & Get 10% Off Your Custom Order! 🎉
                </div>

                {/* Hero Section */}
                <div style={styles.hero}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Design Your Dream Jewellery</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Create unique pieces in 3 easy steps</p>
                </div>

                {/* Occasion Filters */}
                <div style={styles.occasionFilters}>
                    {OCCASIONS.map(occasion => (
                        <button
                            key={occasion}
                            style={{
                                ...styles.occasionBtn,
                                background: selectedOccasion === occasion ? '#C9A961' : 'white',
                                color: selectedOccasion === occasion ? '#0F1419' : '#333',
                                borderColor: selectedOccasion === occasion ? '#C9A961' : '#ddd'
                            }}
                            onClick={() => setSelectedOccasion(occasion)}
                        >
                            {occasion}
                        </button>
                    ))}
                </div>

                {/* Design Templates */}
                <div style={styles.templatesSection}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Start with a Template</h2>
                    <div style={styles.templateGrid}>
                        {DESIGN_TEMPLATES.map((template, idx) => (
                            <div
                                key={idx}
                                style={styles.templateCard}
                                onClick={() => applyTemplate(template)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = '#C9A961';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{template.icon}</div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{template.name}</h4>
                                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                                    {template.metal} • {template.gemstone}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Budget Helper */}
                <BudgetHelper onBudgetChange={setBudgetLimit} />

                <div style={styles.mainGrid}>
                    {/* 3D Preview Section */}
                    <div className="preview-section">
                        <Preview3D
                            type={design.type}
                            metal={design.metal}
                            gemstone={design.gemstone}
                            gemstoneSize={design.gemstoneSize}
                        />
                        <p style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
                            Interactive 3D Preview • Drag to Rotate • Scroll to Zoom
                        </p>
                    </div>

                    {/* Customization Controls */}
                    <div style={styles.controls}>
                        <div style={styles.controlGroup}>
                            <label style={styles.label}>Jewellery Type</label>
                            <select
                                style={styles.select}
                                value={design.type}
                                onChange={(e) => setDesign({ ...design, type: e.target.value })}
                            >
                                <option value="Ring">💍 Ring</option>
                                <option value="Necklace">📿 Necklace</option>
                                <option value="Earrings">💎 Earrings</option>
                                <option value="Bracelet">⌚ Bracelet</option>
                            </select>
                        </div>

                        <div style={styles.controlGroup}>
                            <label style={styles.label}>Metal</label>
                            <select
                                style={styles.select}
                                value={design.metal}
                                onChange={(e) => setDesign({ ...design, metal: e.target.value })}
                            >
                                {Object.keys(PRICES.metal).map(m => (
                                    <option key={m} value={m}>{m} (₹{PRICES.metal[m]}/g)</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.controlGroup}>
                            <label style={styles.label}>Gemstone</label>
                            <select
                                style={styles.select}
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
                            <div style={styles.controlGroup}>
                                <label style={styles.label}>Gemstone Size (Carat): {design.gemstoneSize}</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={design.gemstoneSize}
                                    onChange={(e) => setDesign({ ...design, gemstoneSize: parseFloat(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}

                        <div style={styles.controlGroup}>
                            <label style={styles.label}>Ring Size</label>
                            <select
                                style={styles.select}
                                value={design.size}
                                onChange={(e) => setDesign({ ...design, size: parseInt(e.target.value) })}
                            >
                                {[...Array(15)].map((_, i) => (
                                    <option key={i} value={i + 6}>Size {i + 6}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.controlGroup}>
                            <label style={styles.label}>Engraving (Optional - Max 20 chars)</label>
                            <input
                                type="text"
                                style={styles.select}
                                placeholder="Enter text to engrave..."
                                maxLength="20"
                                value={design.engravingText}
                                onChange={(e) => setDesign({ ...design, engravingText: e.target.value })}
                            />
                            <small style={{ color: '#666' }}>{design.engravingText.length}/20 characters</small>
                            {design.engravingText && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '15px 20px',
                                    background: 'linear-gradient(135deg, #FAF8F3 0%, #F5F2ED 100%)',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                    color: '#0F1419',
                                    border: '2px solid #C9A961',
                                    fontSize: '1.1rem',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 8px rgba(201, 169, 97, 0.2)'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#6B6B6B', marginBottom: '5px' }}>
                                        ✨ Engraving Preview
                                    </div>
                                    <div style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#C9A961' }}>
                                        "{design.engravingText}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Section with Breakdown */}
                        <div style={styles.priceSection}>
                            <div style={styles.priceTag}>
                                ₹{totalPrice.toLocaleString('en-IN')}
                                <span
                                    style={styles.infoIcon}
                                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                >
                                    ℹ️ Price Breakdown
                                </span>
                            </div>

                            {showPriceBreakdown && (
                                <div style={styles.breakdown}>
                                    <div style={styles.breakdownRow}>
                                        <span>Metal Cost (4g):</span>
                                        <span>₹{breakdown.metal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {breakdown.gemstone > 0 && (
                                        <div style={styles.breakdownRow}>
                                            <span>Gemstone ({design.gemstoneSize}ct):</span>
                                            <span>₹{breakdown.gemstone.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div style={styles.breakdownRow}>
                                        <span>Making Charges (15%):</span>
                                        <span>₹{breakdown.making.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={styles.breakdownRow}>
                                        <span>GST (3%):</span>
                                        <span>₹{breakdown.gst.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={{ ...styles.breakdownRow, borderTop: '2px solid #ddd', paddingTop: '8px', fontWeight: 'bold' }}>
                                        <span>Total:</span>
                                        <span>₹{breakdown.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                style={{ ...styles.button, ...styles.primaryBtn }}
                                onClick={handleSaveDesign}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : '🛒 Add to Cart'}
                            </button>
                            <button
                                style={{ ...styles.button, ...styles.secondaryBtn }}
                                onClick={() => setShowShareModal(true)}
                            >
                                📤 Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saved Designs Section */}
                {savedDesigns.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <h2>Your Saved Designs ({savedDesigns.length})</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {savedDesigns.slice(0, 4).map(saved => (
                                <div key={saved._id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>{saved.name}</h4>
                                    <p style={{ color: '#666', fontSize: '0.85rem', margin: '5px 0' }}>
                                        {saved.metal} • {saved.gemstone}
                                    </p>
                                    <p style={{ fontWeight: 'bold', color: '#28a745' }}>
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
                <div style={styles.modal} onClick={() => setShowShareModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Share Your Design</h3>
                        <p style={{ color: '#666' }}>Let your friends see your amazing creation!</p>
                        <div style={styles.shareButtons}>
                            <button
                                style={{ ...styles.button, ...styles.primaryBtn, background: '#25D366' }}
                                onClick={() => shareDesign('whatsapp')}
                            >
                                WhatsApp
                            </button>
                            <button
                                style={{ ...styles.button, ...styles.primaryBtn, background: '#1877F2' }}
                                onClick={() => shareDesign('facebook')}
                            >
                                Facebook
                            </button>
                        </div>
                        <button
                            style={{ ...styles.button, ...styles.secondaryBtn, marginTop: '10px' }}
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
