import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, size = 'medium', text = 'Loading...' }) => {
    return (
        <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className={`spinner ${size}`}></div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
