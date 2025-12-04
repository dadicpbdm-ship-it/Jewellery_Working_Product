import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { API_URL } from '../config';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { getCartCount } = useContext(CartContext);
    const { wishlist } = useContext(WishlistContext);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = React.useState('');

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const searchRef = React.useRef(null);

    // Close suggestions when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounce search suggestions
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                try {
                    const response = await fetch(`${API_URL}/api/products/suggestions?query=${encodeURIComponent(searchTerm)}`);
                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setShowSuggestions(false);
            closeMenu();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/product/${suggestion._id}`);
        setSearchTerm('');
        setShowSuggestions(false);
        closeMenu();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        closeMenu();
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <h1>JewelIndia</h1>
                </Link>

                <div className="navbar-mobile-toggle" onClick={toggleMenu}>
                    <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
                    <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
                    <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
                </div>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <div className="search-container" ref={searchRef}>
                        <form className="navbar-search" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                            />
                            <button type="submit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </form>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions">
                                {suggestions.map((product) => (
                                    <div
                                        key={product._id}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(product)}
                                    >
                                        <img src={product.imageUrl} alt={product.name} />
                                        <div className="suggestion-info">
                                            <span className="suggestion-name">{product.name}</span>
                                            <span className="suggestion-category">{product.category}</span>
                                        </div>
                                        <span className="suggestion-price">₹{product.price.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <ul className="nav-links">
                        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                        <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
                        <li><Link to="/custom-designer" onClick={closeMenu} style={{ color: '#d4af37', fontWeight: 'bold' }}>Design Your Own</Link></li>
                        <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
                        <li>
                            <Link to="/wishlist" className="nav-link" onClick={closeMenu}>
                                Wishlist {wishlist?.length > 0 && <span className="badge">{wishlist.length}</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/cart" className="cart-link" onClick={closeMenu}>
                                Cart ({getCartCount()})
                            </Link>
                        </li>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <li><Link to="/admin/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                                )}
                                {user.role === 'delivery' && (
                                    <li><Link to="/delivery/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                                )}
                                {user.role === 'user' && (
                                    <>
                                        <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                                        <li><Link to="/rewards" onClick={closeMenu}>Rewards</Link></li>
                                    </>
                                )}
                                <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                            </>
                        ) : (
                            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
