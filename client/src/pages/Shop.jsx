import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import Pagination from '../components/Pagination';
import { API_URL } from '../config';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filter states
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || 'All';
    const material = searchParams.get('material') || 'All';
    const occasion = searchParams.get('occasion') || 'All';
    const style = searchParams.get('style') || 'All';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';

    const [localKeyword, setLocalKeyword] = useState(keyword);
    const [localMinPrice, setLocalMinPrice] = useState(minPrice);
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

    const categories = ['All', 'Necklaces', 'Earrings', 'Rings', 'Bangles', 'Bracelets', 'Accessories'];
    const materials = ['All', 'Gold', 'Silver', 'Diamond', 'Platinum', 'Rose Gold', 'White Gold'];
    const occasions = ['All', 'Wedding', 'Party', 'Daily', 'Festival', 'Anniversary', 'Engagement'];
    const styles = ['All', 'Western', 'Traditional', 'Contemporary', 'Fusion', 'Minimalist'];
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' }
    ];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (keyword) query.append('keyword', keyword);
            if (category && category !== 'All') query.append('category', category);
            if (material && material !== 'All') query.append('material', material);
            if (occasion && occasion !== 'All') query.append('occasion', occasion);
            if (style && style !== 'All') query.append('style', style);
            if (minPrice) query.append('minPrice', minPrice);
            if (maxPrice) query.append('maxPrice', maxPrice);
            if (sortBy) query.append('sortBy', sortBy);

            query.append('page', page);
            query.append('limit', '12');

            const response = await fetch(`${API_URL}/api/products?${query.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setProducts(data.products || data);
            setTotalPages(data.pages || 1);
            setTotal(data.total || (Array.isArray(data) ? data.length : 0));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchParams, page]);

    useEffect(() => {
        setLocalKeyword(keyword);
        setLocalMinPrice(minPrice);
        setLocalMaxPrice(maxPrice);
    }, [keyword, minPrice, maxPrice]);

    const updateFilters = (updates) => {
        const params = {};
        const current = {
            keyword: localKeyword,
            category,
            material,
            occasion,
            style,
            minPrice: localMinPrice,
            maxPrice: localMaxPrice,
            sortBy,
            ...updates
        };

        Object.entries(current).forEach(([key, value]) => {
            if (value && value !== 'All' && value !== '') {
                params[key] = value;
            }
        });

        setSearchParams(params);
        setPage(1); // Reset to page 1 when filters change
    };

    const resetFilters = () => {
        setSearchParams({});
        setLocalKeyword('');
        setLocalMinPrice('');
        setLocalMaxPrice('');
        setPage(1);
    };

    const activeFiltersCount = [category, material, occasion, style, minPrice, maxPrice].filter(
        f => f && f !== 'All' && f !== ''
    ).length;

    return (
        <div className="shop-page">
            <div className="container">
                <div className="shop-header">
                    <h1>Discover Our Collection</h1>
                    <p>Exquisite jewellery crafted with precision and passion</p>
                </div>

                {/* Search and Sort Bar */}
                <div className="shop-controls">
                    <form className="search-box" onSubmit={(e) => { e.preventDefault(); updateFilters({ keyword: localKeyword }); }}>
                        <input
                            type="text"
                            placeholder="Search for jewellery..."
                            value={localKeyword}
                            onChange={(e) => setLocalKeyword(e.target.value)}
                        />
                        <button type="submit">🔍</button>
                    </form>

                    <div className="sort-controls">
                        <select value={sortBy} onChange={(e) => updateFilters({ sortBy: e.target.value })}>
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            className="filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            🎛️ Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-header">
                            <h3>Filter Products</h3>
                            {activeFiltersCount > 0 && (
                                <button className="btn-clear-filters" onClick={resetFilters}>
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="filters-grid">
                            {/* Category Filter */}
                            <div className="filter-group">
                                <label>Category</label>
                                <select value={category} onChange={(e) => updateFilters({ category: e.target.value })}>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Material Filter */}
                            <div className="filter-group">
                                <label>Material</label>
                                <select value={material} onChange={(e) => updateFilters({ material: e.target.value })}>
                                    {materials.map(mat => (
                                        <option key={mat} value={mat}>{mat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Occasion Filter */}
                            <div className="filter-group">
                                <label>Occasion</label>
                                <select value={occasion} onChange={(e) => updateFilters({ occasion: e.target.value })}>
                                    {occasions.map(occ => (
                                        <option key={occ} value={occ}>{occ}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Style Filter */}
                            <div className="filter-group">
                                <label>Style</label>
                                <select value={style} onChange={(e) => updateFilters({ style: e.target.value })}>
                                    {styles.map(sty => (
                                        <option key={sty} value={sty}>{sty}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="filter-group price-range">
                                <label>Price Range</label>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={localMinPrice}
                                        onChange={(e) => setLocalMinPrice(e.target.value)}
                                        onBlur={() => updateFilters({ minPrice: localMinPrice })}
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={localMaxPrice}
                                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                                        onBlur={() => updateFilters({ maxPrice: localMaxPrice })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Display with Skeleton Loader */}
                <div className="products-section">
                    <div className="products-header">
                        <h2>
                            {loading ? 'Loading...' : `${total} Product${total !== 1 ? 's' : ''} Found`}
                        </h2>
                    </div>

                    {loading ? (
                        <SkeletonLoader type="card" count={12} />
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms</p>
                            <button className="btn-reset" onClick={resetFilters}>
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={(newPage) => {
                                        setPage(newPage);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
