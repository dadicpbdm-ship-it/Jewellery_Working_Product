import React from 'react';
import './SkeletonLoader.css';

export const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-button"></div>
        </div>
    </div>
);

export const SkeletonList = ({ count = 3 }) => (
    <div className="skeleton-list">
        {Array(count).fill(0).map((_, index) => (
            <div key={index} className="skeleton-list-item">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-list-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="skeleton-table">
        <div className="skeleton-table-header">
            {Array(cols).fill(0).map((_, index) => (
                <div key={index} className="skeleton-table-cell"></div>
            ))}
        </div>
        {Array(rows).fill(0).map((_, rowIndex) => (
            <div key={rowIndex} className="skeleton-table-row">
                {Array(cols).fill(0).map((_, colIndex) => (
                    <div key={colIndex} className="skeleton-table-cell"></div>
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonText = ({ lines = 3 }) => (
    <div className="skeleton-text-block">
        {Array(lines).fill(0).map((_, index) => (
            <div
                key={index}
                className={`skeleton-text ${index === lines - 1 ? 'short' : ''}`}
            ></div>
        ))}
    </div>
);

const SkeletonLoader = ({ type = 'card', count = 1, ...props }) => {
    switch (type) {
        case 'card':
            return (
                <div className="skeleton-grid">
                    {Array(count).fill(0).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            );
        case 'list':
            return <SkeletonList count={count} {...props} />;
        case 'table':
            return <SkeletonTable {...props} />;
        case 'text':
            return <SkeletonText {...props} />;
        default:
            return <SkeletonCard />;
    }
};

export default SkeletonLoader;
