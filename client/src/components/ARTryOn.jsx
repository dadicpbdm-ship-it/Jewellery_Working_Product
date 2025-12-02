import React, { useState, useRef, useEffect } from 'react';

const ARTryOn = ({ productName, productImage }) => {
    const [isActive, setIsActive] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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
            setIsActive(true);
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for AR try-on. Please enable camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsActive(false);
    };

    const captureSnapshot = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);

            // Download the snapshot
            canvasRef.current.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ar-tryon-${productName}.png`;
                a.click();
            });
        }
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const styles = {
        container: {
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
            justifyContent: 'center'
        },
        video: {
            maxWidth: '90%',
            maxHeight: '70vh',
            borderRadius: '12px',
            transform: 'scaleX(-1)' // Mirror effect
        },
        controls: {
            display: 'flex',
            gap: '15px',
            marginTop: '20px'
        },
        button: {
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600'
        },
        closeBtn: {
            background: '#dc3545',
            color: 'white'
        },
        captureBtn: {
            background: '#28a745',
            color: 'white'
        },
        startBtn: {
            background: '#d4af37',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        notice: {
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '0.9rem'
        }
    };

    if (!isActive) {
        return (
            <button style={styles.startBtn} onClick={startCamera}>
                📷 Try On with AR
            </button>
        );
    }

    return (
        <div style={styles.container}>
            <p style={styles.notice}>
                Note: This is a basic AR preview. Full AR with face tracking requires specialized libraries.
            </p>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={styles.video}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={styles.controls}>
                <button
                    style={{ ...styles.button, ...styles.captureBtn }}
                    onClick={captureSnapshot}
                >
                    📸 Capture
                </button>
                <button
                    style={{ ...styles.button, ...styles.closeBtn }}
                    onClick={stopCamera}
                >
                    ✕ Close
                </button>
            </div>
        </div>
    );
};

export default ARTryOn;
