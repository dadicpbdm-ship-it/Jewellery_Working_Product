import React, { useState, useRef, useEffect } from 'react';

const ARTryOn = ({ productName, productImage, onClose }) => {
    const [isActive, setIsActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const containerRef = useRef(null);

    // Start Camera ONLY when active
    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isActive]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for AR try-on. Please ensure you have allowed camera permissions.');
            setIsActive(false);
            if (onClose) onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        // setIsActive(false); // Do not reset isActive here to allow toggle
    };

    // --- Drag Logic ---
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        setDragStart({
            x: clientX - position.x,
            y: clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // --- Snapshot Logic ---
    const captureSnapshot = () => {
        if (videoRef.current && canvasRef.current && overlayRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // 1. Draw Video (Mirrored)
            context.save();
            context.scale(-1, 1);
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            context.restore();

            // 2. Calculate Overlay Position relative to Video
            // We need to map the screen coordinates of the overlay to the canvas coordinates
            const videoRect = video.getBoundingClientRect();
            const overlayRect = overlayRef.current.getBoundingClientRect();

            // Scale factors between screen pixel and video internal resolution
            const scaleX = canvas.width / videoRect.width;
            const scaleY = canvas.height / videoRect.height;

            // Calculate center position on canvas
            const centerX = (overlayRect.left - videoRect.left + overlayRect.width / 2) * scaleX;
            const centerY = (overlayRect.top - videoRect.top + overlayRect.height / 2) * scaleY;

            // Calculate scaled dimensions
            // const drawWidth = overlayRef.current.width * scale * scaleX; 
            // const drawHeight = overlayRef.current.height * scale * scaleY;

            // Draw Image Transformed
            context.save();
            context.translate(centerX, centerY);
            context.rotate((rotation * Math.PI) / 180);
            context.scale(scale, scale);

            // Draw image centered at 0,0 (which is now translated to centerX, centerY)
            // Note: We use the original image source to ensure quality
            // const img = new Image();
            // img.src = productImage;
            // Ensure image is loaded before drawing (it should be cached by browser)
            // Since we are synchronous here, we assume it draws immediately. 
            // For robustness, we draw the overlayRef which is an <img> element.
            context.drawImage(overlayRef.current, -overlayRef.current.width / 2, -overlayRef.current.height / 2);

            context.restore();

            // 3. Download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dadi-tryon-${productName.replace(/\s+/g, '-').toLowerCase()}.png`;
                a.click();
            });
        }
    };

    // Styles
    const styles = {
        wrapper: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
        },
        container: {
            position: 'relative',
            width: '100%',
            maxWidth: '500px', // Mobile width
            height: '70vh',
            background: '#000',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(201, 169, 97, 0.3)',
            border: '2px solid #C9A961'
        },
        video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)'
        },
        overlay: {
            position: 'absolute',
            top: '50%', // Start centered
            left: '50%',
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            maxWidth: '150px', // Base size
            pointerEvents: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            zIndex: 10,
            userSelect: 'none'
        },
        controlsPanel: {
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '1.5rem',
            borderRadius: '16px',
            marginTop: '1rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        sliderRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: '#333',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        slider: {
            flex: 1,
            accentColor: '#C9A961',
            height: '6px',
            background: '#eee',
            borderRadius: '3px',
            appearance: 'auto' // Let browser handle basic input range style or custom if needed
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '0.5rem'
        },
        btn: {
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.2s'
        },
        captureBtn: {
            background: 'linear-gradient(135deg, #111 0%, #333 100%)',
            color: '#fff',
            border: '1px solid #333'
        },
        closeBtn: {
            background: 'transparent',
            color: '#333',
            border: '1px solid #ccc'
        },
        instruction: {
            color: '#666',
            fontSize: '0.8rem',
            textAlign: 'center',
            marginTop: '-0.5rem'
        }
    };

    if (!isActive) {
        return (
            <button
                onClick={() => setIsActive(true)}
                style={{
                    background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                    color: '#C9A961',
                    border: '1px solid #C9A961',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(201, 169, 97, 0.2)',
                    transition: 'transform 0.2s',
                    marginTop: '0'
                }}
            >
                📷 Virtual Try-On
            </button>
        );
    }

    return (
        <div style={styles.wrapper}>
            <div
                style={styles.container}
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Live Video Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.video}
                />

                {/* Draggable Product Overlay */}
                <img
                    ref={overlayRef}
                    src={productImage}
                    alt="AR Overlay"
                    style={styles.overlay}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    draggable="false"
                />

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Scale & Rotate Controls */}
            <div style={styles.controlsPanel}>
                <div style={styles.instruction}>
                    👆 Drag the jewellery to position it on your ear/neck.
                </div>

                <div style={styles.sliderRow}>
                    <span>Size</span>
                    <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        style={styles.slider}
                    />
                </div>

                <div style={styles.sliderRow}>
                    <span>Rotate</span>
                    <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        style={styles.slider}
                    />
                    <span>{rotation}°</span>
                </div>

                <div style={styles.buttonGroup}>
                    <button
                        style={{ ...styles.btn, ...styles.closeBtn }}
                        onClick={() => { setIsActive(false); if (onClose) onClose(); }}
                    >
                        ✕ Close
                    </button>
                    <button
                        style={{ ...styles.btn, ...styles.captureBtn }}
                        onClick={captureSnapshot}
                    >
                        📸 Save Look
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ARTryOn;
