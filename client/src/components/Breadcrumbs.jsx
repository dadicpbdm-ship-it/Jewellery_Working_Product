import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = ({ productName }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Custom labels for routes
    const routeLabels = {
        'shop': 'Shop',
        'product': 'Product',
        'cart': 'Shopping Cart',
        'checkout': 'Checkout',
        'order': 'Order',
        'wishlist': 'Wishlist',
        'dashboard': 'Dashboard',
        'contact': 'Contact Us',
        'login': 'Login',
        'register': 'Register'
    };

    // Don't show breadcrumbs on home page
    if (pathnames.length === 0) return null;

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                </li>
                {pathnames.map((path, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    // Use custom label or capitalize path
                    let label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);

                    // If it's a product page and we have a product name, use it
                    if (path === 'product' && productName && isLast) {
                        label = productName;
                    }

                    // If it's an ID (like order ID), shorten it
                    if (path.length === 24 && /^[a-f0-9]+$/.test(path)) {
                        label = `#${path.substring(0, 8)}...`;
                    }

                    return (
                        <li key={routeTo} className="breadcrumb-item">
                            <span className="breadcrumb-separator">/</span>
                            {isLast ? (
                                <span className="breadcrumb-current">{label}</span>
                            ) : (
                                <Link to={routeTo}>{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
