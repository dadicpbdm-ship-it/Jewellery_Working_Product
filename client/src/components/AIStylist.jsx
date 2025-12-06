import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import './AIStylist.css';

const QUESTIONS = [
    {
        id: 'start',
        text: "Hello! I'm Dadi's Virtual Assistant. ✨ I can help you find the perfect jewellery. What's the occasion?",
        options: [
            { label: '👰 Wedding', value: 'Wedding', next: 'material' },
            { label: '🎉 Party', value: 'Party', next: 'style' },
            { label: '📅 Daily Wear', value: 'Daily', next: 'category' },
            { label: '🎁 Gift', value: 'Gift', next: 'budget' }
        ]
    },
    {
        id: 'material',
        text: "A special choice! Which metal do you prefer?",
        options: [
            { label: '✨ Gold', value: 'Gold', next: 'budget' },
            { label: '💎 Diamond', value: 'Diamond', next: 'budget' },
            { label: '⚪ Platinum', value: 'Platinum', next: 'budget' }
        ]
    },
    {
        id: 'style',
        text: "What's your preferred style?",
        options: [
            { label: '🏛️ Traditional', value: 'Traditional', next: 'budget' },
            { label: '💃 Modern', value: 'Western', next: 'budget' },
            { label: '💠 Minimalist', value: 'Minimalist', next: 'budget' }
        ]
    },
    {
        id: 'category',
        text: "What type of jewellery are you looking for?",
        options: [
            { label: '💍 Ring', value: 'Ring', next: 'budget' },
            { label: '⛓️ Necklace', value: 'Necklace', next: 'budget' },
            { label: '👂 Earrings', value: 'Earrings', next: 'budget' }
        ]
    },
    {
        id: 'budget',
        text: "And finally, what is your budget range?",
        options: [
            { label: 'Under ₹20k', value: '0-20000', next: 'finish' },
            { label: '₹20k - ₹50k', value: '20000-50000', next: 'finish' },
            { label: '₹50k - ₹1L', value: '50000-100000', next: 'finish' },
            { label: 'No Limit 💳', value: '100000-10000000', next: 'finish' }
        ]
    }
];

const AIStylist = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentStep, setCurrentStep] = useState('start');
    const [answers, setAnswers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const messagesEndRef = useRef(null);

    // Initial Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage(QUESTIONS[0].text, QUESTIONS[0].options);
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const addBotMessage = (text, options = null) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'bot', text, options }]);
        }, 800); // Simulated typing delay
    };

    const handleOptionClick = (option) => {
        // 1. Add User Message
        setMessages(prev => [...prev, { type: 'user', text: option.label }]);

        // 2. Update State
        const currentQ = QUESTIONS.find(q => q.id === currentStep);

        // Map answer key based on current step
        const keyMap = {
            'budget': 'price',
            'start': 'occasion',
            'category': 'category',
            'material': 'material',
            'style': 'style'
        };

        const key = keyMap[currentStep] || currentStep;
        const newAnswers = { ...answers, [key]: option.value };
        setAnswers(newAnswers);

        // 3. Next Step
        if (option.next === 'finish') {
            fetchRecommendations(newAnswers);
        } else {
            const nextQ = QUESTIONS.find(q => q.id === option.next);
            if (nextQ) {
                setCurrentStep(option.next);
                addBotMessage(nextQ.text, nextQ.options);
            }
        }
    };

    const fetchRecommendations = async (finalAnswers) => {
        setIsTyping(true);
        try {
            // Build Query String
            const params = new URLSearchParams();
            if (finalAnswers.occasion && finalAnswers.occasion !== 'Gift') params.append('occasion', finalAnswers.occasion);
            if (finalAnswers.material) params.append('material', finalAnswers.material);
            if (finalAnswers.style) params.append('style', finalAnswers.style);
            if (finalAnswers.category) params.append('category', finalAnswers.category);

            if (finalAnswers.price) {
                const [min, max] = finalAnswers.price.split('-');
                params.append('minPrice', min);
                params.append('maxPrice', max);
            }

            const res = await fetch(`${API_URL}/api/products?${params.toString()}&limit=5`);
            const data = await res.json();

            setIsTyping(false);
            if (data.products && data.products.length > 0) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: `While I was searching... I found ${data.products.length} perfect matches for you! 💖`,
                    products: data.products
                }]);
            } else {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: "I couldn't find an exact match, but you can explore our full collection!",
                    options: [{ label: 'Browse All', value: 'browse', next: 'browse' }]
                }]);
            }

        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'bot', text: "Oops! My connection is a bit fuzzy. Please try again later." }]);
        }
    };

    const restartQuiz = () => {
        setMessages([]);
        setAnswers({});
        setCurrentStep('start');
        setRecommendations([]);
        addBotMessage(QUESTIONS[0].text, QUESTIONS[0].options);
    };

    return (
        <>
            {/* Trigger Button */}
            <div className="ai-stylist-trigger" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '✨'}
                {!isOpen && <div className="trigger-tooltip">Ask Dadi's Assistant</div>}
            </div>

            {/* Chat Panel */}
            {isOpen && (
                <div className="stylist-panel">
                    <div className="stylist-header">
                        <div className="stylist-title">
                            <h3>🤖 Dadi's Assistant</h3>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="stylist-content">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message message-${msg.type}`}>
                                {msg.text}

                                {/* Options Grid */}
                                {msg.options && (
                                    <div className="options-grid">
                                        {msg.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                className="option-btn"
                                                onClick={() => {
                                                    if (opt.value === 'browse') {
                                                        window.location.href = '/shop';
                                                    } else {
                                                        handleOptionClick(opt);
                                                    }
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Product Carousel */}
                                {msg.products && (
                                    <div className="recommendations-carousel">
                                        {msg.products.map(p => (
                                            <Link to={`/product/${p._id}`} key={p._id} className="rec-card" onClick={() => setIsOpen(false)}>
                                                <img src={p.imageUrl} alt={p.name} className="rec-image" />
                                                <div className="rec-info">
                                                    <h4>{p.name}</h4>
                                                    <p>₹{p.price.toLocaleString('en-IN')}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        )}

                        {(messages.length > 2 && !isTyping && !messages[messages.length - 1].options) && (
                            <button className="restart-btn" onClick={restartQuiz}>🔄 Start Over</button>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}
        </>
    );
};

export default AIStylist;
