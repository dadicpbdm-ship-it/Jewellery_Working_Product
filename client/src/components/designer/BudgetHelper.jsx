import React, { useState } from 'react';

const BudgetHelper = ({ onBudgetChange }) => {
    const [budget, setBudget] = useState(50000);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const BUDGET_RANGES = [
        { label: 'Under ₹20K', value: 20000, icon: '💰' },
        { label: '₹20K - ₹40K', value: 40000, icon: '💎' },
        { label: '₹40K - ₹60K', value: 60000, icon: '👑' },
        { label: 'Above ₹60K', value: 100000, icon: '✨' }
    ];

    const getSuggestions = (budgetAmount) => {
        if (budgetAmount <= 20000) {
            return {
                metals: ['Silver', 'Gold (lower weight)'],
                gemstones: ['None', 'Small Diamond (0.5ct)'],
                tip: 'Consider silver or lightweight gold designs'
            };
        } else if (budgetAmount <= 40000) {
            return {
                metals: ['Gold', 'Rose Gold'],
                gemstones: ['Diamond (1ct)', 'Emerald', 'Ruby'],
                tip: 'Perfect range for classic gold rings with gemstones'
            };
        } else if (budgetAmount <= 60000) {
            return {
                metals: ['White Gold', 'Rose Gold', 'Gold'],
                gemstones: ['Diamond (1.5ct)', 'Ruby (2ct)', 'Sapphire'],
                tip: 'Explore premium metals and larger gemstones'
            };
        } else {
            return {
                metals: ['Platinum', 'White Gold'],
                gemstones: ['Diamond (2ct+)', 'Large Ruby', 'Large Sapphire'],
                tip: 'Luxury designs with platinum and premium gemstones'
            };
        }
    };

    const suggestions = getSuggestions(budget);

    const handleBudgetChange = (value) => {
        setBudget(value);
        onBudgetChange(value);
    };

    const styles = {
        container: {
            background: 'linear-gradient(135deg, #C9A961 0%, #E5D4A6 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: '#0F1419',
            marginBottom: '30px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        title: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            margin: 0
        },
        budgetDisplay: {
            fontSize: '1.8rem',
            fontWeight: 'bold'
        },
        slider: {
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            outline: 'none',
            marginBottom: '15px',
            cursor: 'pointer'
        },
        quickButtons: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '20px'
        },
        quickBtn: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            padding: '12px 8px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            textAlign: 'center'
        },
        suggestionsToggle: {
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            width: '100%',
            marginBottom: '15px'
        },
        suggestions: {
            background: 'rgba(255,255,255,0.15)',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '15px'
        },
        suggestionSection: {
            marginBottom: '12px'
        },
        suggestionLabel: {
            fontWeight: 'bold',
            marginBottom: '5px',
            fontSize: '0.9rem'
        },
        suggestionItems: {
            fontSize: '0.85rem',
            opacity: 0.9
        },
        tip: {
            background: 'rgba(255,255,255,0.2)',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginTop: '10px',
            fontStyle: 'italic'
        }
    };

    return (
        <div className="budget-helper-container">
            <div className="budget-header">
                <h3 className="budget-title">💰 Budget Helper</h3>
                <div className="budget-display">₹{budget.toLocaleString('en-IN')}</div>
            </div>

            <input
                type="range"
                min="10000"
                max="150000"
                step="5000"
                value={budget}
                onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                className="budget-slider"
            />

            <div className="budget-quick-buttons">
                {BUDGET_RANGES.map((range, idx) => (
                    <button
                        key={idx}
                        className="budget-quick-btn"
                        onClick={() => handleBudgetChange(range.value)}
                    >
                        <div className="budget-btn-icon">{range.icon}</div>
                        {range.label}
                    </button>
                ))}
            </div>

            <button
                className="budget-suggestions-toggle"
                onClick={() => setShowSuggestions(!showSuggestions)}
            >
                {showSuggestions ? '▼' : '▶'} Smart Suggestions
            </button>

            {showSuggestions && (
                <div className="budget-suggestions">
                    <div className="suggestion-section">
                        <div className="suggestion-label">Recommended Metals:</div>
                        <div className="suggestion-items">{suggestions.metals.join(', ')}</div>
                    </div>
                    <div className="suggestion-section">
                        <div className="suggestion-label">Recommended Gemstones:</div>
                        <div className="suggestion-items">{suggestions.gemstones.join(', ')}</div>
                    </div>
                    <div className="suggestion-tip">
                        💡 Tip: {suggestions.tip}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetHelper;
