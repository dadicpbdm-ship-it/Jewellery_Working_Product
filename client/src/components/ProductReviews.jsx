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
    const [imageUrls, setImageUrls] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/products/${productId}/reviews`);
            const data = await response.json();
            if (response.ok) {
                setReviews(data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            error('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            // Split URLs by comma and trim
            const images = imageUrls.split(',').map(url => url.trim()).filter(url => url);

            const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ rating, comment, images })
            });

            const data = await response.json();

            if (response.ok) {
                success('Review submitted successfully!');
                setComment('');
                setImageUrls('');
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

    return (
        <div className="product-reviews">
            {/* Review Form */}
            {
                user ? (
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
                        <div className="form-group">
                            <label>Add Photos (Optional)</label>
                            <input
                                type="text"
                                value={imageUrls}
                                onChange={(e) => setImageUrls(e.target.value)}
                                placeholder="Paste image URLs separated by commas"
                                className="image-url-input"
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                * Paste direct image links (e.g., https://example.com/image.jpg)
                            </small>
                        </div>
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <p className="login-prompt">Please <a href="/login">login</a> to write a review</p>
                )
            }

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

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                    {review.images.map((img, index) => (
                                        <div key={index} className="review-image-container">
                                            <img src={img} alt={`Review by ${review.name} ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

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
