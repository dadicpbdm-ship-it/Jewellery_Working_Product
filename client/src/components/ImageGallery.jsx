import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName = '', videoUrl = null }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Combine images and video into a single list of media items
    // If videoUrl exists, it becomes the second item (index 1) usually, or we can prepend it
    // Strategy: Append video at the end of the images list
    const mediaList = [...(Array.isArray(images) && images.length > 0 ? images : [images])];

    if (videoUrl) {
        mediaList.push({ type: 'video', src: videoUrl });
    }

    const currentMedia = mediaList[selectedImage];
    const isVideo = typeof currentMedia === 'object' && currentMedia.type === 'video';

    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
        setIsZoomed(false);
    };

    const handlePrevious = () => {
        setSelectedImage((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedImage((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    };

    const handleMouseMove = (e) => {
        if (!isZoomed || isVideo) return; // Disable zoom for video

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
                    className={`main-image ${isZoomed && !isVideo ? 'zoomed' : ''}`}
                    onMouseEnter={() => !isVideo && setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => !isVideo && setShowLightbox(true)}
                    style={isZoomed && !isVideo ? {
                        backgroundImage: `url(${currentMedia})`,
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                        backgroundSize: '200%',
                        backgroundRepeat: 'no-repeat'
                    } : {}}
                >
                    {isVideo ? (
                        <video
                            src={currentMedia.src}
                            controls
                            autoPlay
                            muted // Start muted for better UX
                            loop
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <>
                            <img
                                src={currentMedia}
                                alt={`${productName} - View ${selectedImage + 1}`}
                                style={{ opacity: isZoomed ? 0 : 1 }}
                            />
                            {!isZoomed && <div className="zoom-hint">🔍 Hover to zoom · Click for fullscreen</div>}
                        </>
                    )}
                </div>

                {/* Navigation Arrows (if multiple items) */}
                {mediaList.length > 1 && (
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
            {mediaList.length > 1 && (
                <div className="thumbnails-container">
                    {mediaList.map((item, index) => {
                        const isItemVideo = typeof item === 'object' && item.type === 'video';
                        return (
                            <div
                                key={index}
                                className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                                onClick={() => handleThumbnailClick(index)}
                            >
                                {isItemVideo ? (
                                    <div className="video-thumbnail">
                                        <span>▶</span>
                                    </div>
                                ) : (
                                    <img src={item} alt={`${productName} thumbnail ${index + 1}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox Modal */}
            {showLightbox && !isVideo && (
                <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
                            ×
                        </button>
                        <img
                            src={currentMedia}
                            alt={`${productName} - Full view ${selectedImage + 1}`}
                        />
                        {mediaList.length > 1 && (
                            <>
                                <button className="lightbox-arrow prev" onClick={handlePrevious}>
                                    ‹
                                </button>
                                <button className="lightbox-arrow next" onClick={handleNext}>
                                    ›
                                </button>
                                <div className="lightbox-counter">
                                    {selectedImage + 1} / {mediaList.length}
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
