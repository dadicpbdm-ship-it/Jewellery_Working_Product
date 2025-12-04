import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import './CustomizationModal.css';

const CustomizationModal = ({ product, onClose, onCustomize }) => {
    const { success, error } = useToast();
    const [fonts, setFonts] = useState([]);
    const [customization, setCustomization] = useState({
        engraving: { text: '', font: 'serif' },
        selectedSize: '',
        selectedMaterial: product.material
    });
    const [pricing, setPricing] = useState({
        totalPrice: product.price,
        breakdown: { basePrice: product.price, engravingCost: 0, materialAdjustment: 0 }
    });

    useEffect(() => {
        fetchFonts();
    }, []);

    useEffect(() => {
        calculatePrice();
    }, [customization]);

    const fetchFonts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/customizations/fonts`);
            if (response.ok) {
                const data = await response.json();
                setFonts(data);
            }
        } catch (err) {
            console.error('Error fetching fonts:', err);
        }
    };

    const calculatePrice = async () => {
        try {
            const response = await fetch(`${API_URL}/api/customizations/calculate-price`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    engraving: customization.engraving.text ? customization.engraving : null,
                    materialVariant: customization.selectedMaterial !== product.material ? customization.selectedMaterial : null
                })
            });
            if (response.ok) {
                const data = await response.json();
                setPricing(data);
            }
        } catch (err) {
            console.error('Error calculating price:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        try {
            const response = await fetch(`${API_URL}/api/customizations/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    engraving: customization.engraving.text ? customization.engraving : null,
                    size: customization.selectedSize || null,
                    materialVariant: customization.selectedMaterial !== product.material ? customization.selectedMaterial : null
                })
            });

            const result = await response.json();
            if (!result.valid) {
                error(result.errors.join(', '));
                return;
            }

            // Pass customization to parent
            onCustomize({
                ...customization,
                totalPrice: pricing.totalPrice,
                customizationCost: pricing.breakdown.engravingCost + pricing.breakdown.materialAdjustment
            });
            success('Customization applied!');
            onClose();
        } catch (err) {
            console.error('Error validating customization:', err);
            error('Error validating customization');
        }
    };

    const hasCustomization = product.customizationOptions && (
        product.customizationOptions.allowEngraving ||
        product.customizationOptions.availableSizes?.length > 0 ||
        product.customizationOptions.materialVariants?.length > 0
    );

    if (!hasCustomization) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content customization-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Customize Your Product</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Product Info */}
                    <div className="product-preview">
                        <img src={product.imageUrl} alt={product.name} />
                        <div>
                            <h4>{product.name}</h4>
                            <p className="base-price">Base Price: ₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Engraving Section */}
                    {product.customizationOptions.allowEngraving && (
                        <div className="customization-section">
                            <h3>✍️ Engraving</h3>
                            <div className="form-group">
                                <label>Engraving Text ({customization.engraving.text.length}/{product.customizationOptions.maxEngravingChars})</label>
                                <input
                                    type="text"
                                    maxLength={product.customizationOptions.maxEngravingChars}
                                    value={customization.engraving.text}
                                    onChange={(e) => setCustomization({
                                        ...customization,
                                        engraving: { ...customization.engraving, text: e.target.value }
                                    })}
                                    placeholder="Enter your text..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Font Style</label>
                                <select
                                    value={customization.engraving.font}
                                    onChange={(e) => setCustomization({
                                        ...customization,
                                        engraving: { ...customization.engraving, font: e.target.value }
                                    })}
                                >
                                    {fonts.map(font => (
                                        <option key={font.id} value={font.id}>{font.name}</option>
                                    ))}
                                </select>
                            </div>
                            {customization.engraving.text && (
                                <div className="engraving-preview" style={{ fontFamily: customization.engraving.font }}>
                                    {customization.engraving.text}
                                </div>
                            )}
                            <p className="customization-cost">+₹{product.customizationOptions.engravingPrice.toLocaleString('en-IN')}</p>
                        </div>
                    )}

                    {/* Size Selection */}
                    {product.customizationOptions.availableSizes?.length > 0 && (
                        <div className="customization-section">
                            <h3>📏 Size</h3>
                            <div className="size-options">
                                {product.customizationOptions.availableSizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={`size-btn ${customization.selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setCustomization({ ...customization, selectedSize: size })}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Material Variants */}
                    {product.customizationOptions.materialVariants?.length > 0 && (
                        <div className="customization-section">
                            <h3>💎 Material</h3>
                            <div className="material-options">
                                <button
                                    type="button"
                                    className={`material-btn ${customization.selectedMaterial === product.material ? 'active' : ''}`}
                                    onClick={() => setCustomization({ ...customization, selectedMaterial: product.material })}
                                >
                                    {product.material} (Original)
                                </button>
                                {product.customizationOptions.materialVariants.map(variant => (
                                    variant.available && (
                                        <button
                                            key={variant.material}
                                            type="button"
                                            className={`material-btn ${customization.selectedMaterial === variant.material ? 'active' : ''}`}
                                            onClick={() => setCustomization({ ...customization, selectedMaterial: variant.material })}
                                        >
                                            {variant.material}
                                            {variant.priceAdjustment !== 0 && (
                                                <span className="price-diff">
                                                    {variant.priceAdjustment > 0 ? '+' : ''}₹{variant.priceAdjustment.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price Summary */}
                    <div className="price-summary">
                        <div className="summary-row">
                            <span>Base Price:</span>
                            <span>₹{pricing.breakdown.basePrice.toLocaleString('en-IN')}</span>
                        </div>
                        {pricing.breakdown.engravingCost > 0 && (
                            <div className="summary-row">
                                <span>Engraving:</span>
                                <span>+₹{pricing.breakdown.engravingCost.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {pricing.breakdown.materialAdjustment !== 0 && (
                            <div className="summary-row">
                                <span>Material Adjustment:</span>
                                <span>{pricing.breakdown.materialAdjustment > 0 ? '+' : ''}₹{pricing.breakdown.materialAdjustment.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total Price:</span>
                            <span>₹{pricing.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary btn-full">
                        Apply Customization
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomizationModal;
