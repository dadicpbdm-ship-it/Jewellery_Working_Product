import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, showPageNumbers = 5 }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const halfShow = Math.floor(showPageNumbers / 2);

        let startPage = Math.max(1, currentPage - halfShow);
        let endPage = Math.min(totalPages, currentPage + halfShow);

        // Adjust if we're near the start or end
        if (currentPage <= halfShow) {
            endPage = Math.min(totalPages, showPageNumbers);
        }
        if (currentPage + halfShow >= totalPages) {
            startPage = Math.max(1, totalPages - showPageNumbers + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        if (page !== '...' && page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <div className="pagination">
            <button
                className="pagination-btn pagination-prev"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                ← Previous
            </button>

            <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        className={`pagination-number ${page === currentPage ? 'active' : ''
                            } ${page === '...' ? 'ellipsis' : ''}`}
                        onClick={() => handlePageClick(page)}
                        disabled={page === '...'}
                        aria-label={page === '...' ? 'More pages' : `Page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                className="pagination-btn pagination-next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                Next →
            </button>
        </div>
    );
};

export default Pagination;
