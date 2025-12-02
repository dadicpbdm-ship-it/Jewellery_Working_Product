import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
    const { user } = useContext(AuthContext);
    const { success, error } = useToast();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/products/${productId}/reviews`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            error('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            const data = await response.json();

            if (response.ok) {
                success('Review submitted successfully!');
                setComment('');
                setRating(5);
                fetchReviews();
            } else {
                error(data.message || 'Failed to submit review');
            }
        } catch (err) {
            error('Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    const [hoverRating, setHoverRating] = useState(0);

    const renderStars = (currentRating, interactive = false, onRate = null) => {
        const displayRating = interactive && hoverRating > 0 ? hoverRating : currentRating;

        return (
            <div
                className="star-rating"
                onMouseLeave={() => interactive && setHoverRating(0)}
            >
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= displayRating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                        onClick={() => {
                            if (interactive && onRate) {
                                onRate(star);
                            }
                        }}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        style={interactive ? { cursor: 'pointer' } : {}}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // Calculate ratings breakdown
    const getRatingsBreakdown = () => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
        });
        return breakdown;
    };

    const ratingsBreakdown = getRatingsBreakdown();
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    return (
        <div className="product-reviews">
            <h2>Customer Reviews</h2>

            {/* Ratings Summary */}
            {totalReviews > 0 && (
                <div className="ratings-summary">
                    <div className="average-rating">
                        <div className="rating-number">{averageRating}</div>
                        <div className="rating-stars">
                            {renderStars(Math.round(averageRating))}
                        </div>
                        <div className="rating-count">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="ratings-breakdown">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingsBreakdown[star] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="breakdown-row">
                                    <span className="star-label">{star} ★</span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="count-label">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Review Form */}
            {user ? (
                <form className="review-form" onSubmit={handleSubmit}>
                    <h3>Write a Review</h3>
                    <div className="form-group">
                        <label>Rating</label>
                        {renderStars(rating, true, setRating)}
                    </div>
                    <div className="form-group">
                        <label>Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            required
                            rows="4"
                        />
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <p className="login-prompt">Please <a href="/login">login</a> to write a review</p>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
                {loading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="review-item">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <strong>{review.name}</strong>
                                    {review.verifiedPurchase && (
                                        <span className="verified-badge" title="Verified Purchase">
                                            ✓ Verified Purchase
                                        </span>
                                    )}
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            <p className="review-date">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="review-comment">{review.comment}</p>

                            {/* Helpful Votes */}
                            {user && (
                                <div className="review-actions">
                                    <button
                                        className="helpful-btn"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(
                                                    `${API_URL}/api/products/${productId}/reviews/${review._id}/helpful`,
                                                    {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Authorization': `Bearer ${user.token}`
                                                        }
                                                    }
                                                );
                                                const data = await response.json();
                                                if (response.ok) {
                                                    success('Thank you for your feedback!');
                                                    fetchReviews();
                                                } else {
                                                    error(data.message || 'Failed to record vote');
                                                }
                                            } catch (err) {
                                                error('Error recording vote');
                                            }
                                        }}
                                    >
                                        👍 Helpful ({review.helpfulVotes || 0})
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
