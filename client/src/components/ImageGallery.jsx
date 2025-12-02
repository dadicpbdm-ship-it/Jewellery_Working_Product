import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName = '' }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Ensure images is an array and has at least one image
    const imageList = Array.isArray(images) && images.length > 0 ? images : [images];

    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
        setIsZoomed(false);
    };

    const handlePrevious = () => {
        setSelectedImage((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedImage((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    };

    const handleMouseMove = (e) => {
        if (!isZoomed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setMousePosition({ x, y });
    };

    return (
        <div className="image-gallery">
            {/* Main Image */}
            <div className="main-image-container">
                <div
                    className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => setShowLightbox(true)}
                    style={isZoomed ? {
                        backgroundImage: `url(${imageList[selectedImage]})`,
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                        backgroundSize: '200%',
                        backgroundRepeat: 'no-repeat'
                    } : {}}
                >
                    <img
                        src={imageList[selectedImage]}
                        alt={`${productName} - View ${selectedImage + 1}`}
                        style={{ opacity: isZoomed ? 0 : 1 }}
                    />
                    {!isZoomed && <div className="zoom-hint">🔍 Hover to zoom · Click for fullscreen</div>}
                </div>

                {/* Navigation Arrows (if multiple images) */}
                {imageList.length > 1 && (
                    <>
                        <button className="nav-arrow prev" onClick={handlePrevious}>
                            ‹
                        </button>
                        <button className="nav-arrow next" onClick={handleNext}>
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
                <div className="thumbnails-container">
                    {imageList.map((image, index) => (
                        <div
                            key={index}
                            className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <img src={image} alt={`${productName} thumbnail ${index + 1}`} />
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {showLightbox && (
                <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
                            ×
                        </button>
                        <img
                            src={imageList[selectedImage]}
                            alt={`${productName} - Full view ${selectedImage + 1}`}
                        />
                        {imageList.length > 1 && (
                            <>
                                <button className="lightbox-arrow prev" onClick={handlePrevious}>
                                    ‹
                                </button>
                                <button className="lightbox-arrow next" onClick={handleNext}>
                                    ›
                                </button>
                                <div className="lightbox-counter">
                                    {selectedImage + 1} / {imageList.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
