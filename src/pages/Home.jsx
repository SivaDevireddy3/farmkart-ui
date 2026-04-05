import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { mangoAPI, sellerAPI } from '../api'
import MangoCard from '../components/MangoCard'
import RatingModal from '../components/RatingModal'
import { Search, Store, X, LogIn, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Home({ addToCart, cart, clearCart }) {
  const { isCustomer, user } = useAuth()

  const [mangoes, setMangoes] = useState([])
  const [categories, setCategories] = useState([])
  const [sellers, setSellers] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSeller, setSelectedSeller] = useState(null) // { id, storeName }
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [ratingMango, setRatingMango] = useState(null) // mango to rate
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState('default') // default | price_asc | price_desc | rating

  // Which seller's ID is currently in the cart (to enforce single-store rule)
  const cartSellerId = cart?.length > 0 ? cart[0]?.sellerId : null

  useEffect(() => {
    sellerAPI.getActive().then(r => setSellers(r.data)).catch(() => { })
  }, [])

  useEffect(() => {
    const params = {}
    if (selectedSeller) params.sellerId = selectedSeller.id
    mangoAPI.getCategories(params).then(r => setCategories(r.data)).catch(() => { })
  }, [selectedSeller])

  useEffect(() => {
    setLoading(true)
    const params = { category: selectedCat, search }
    if (selectedSeller) params.sellerId = selectedSeller.id
    mangoAPI.getAll(params)
      .then(r => setMangoes(r.data))
      .catch(() => setMangoes([]))
      .finally(() => setLoading(false))
  }, [selectedCat, search, selectedSeller])

  const handleAddToCart = useCallback((mango) => {
    // Enforce single-store cart (like Swiggy/Zomato)
    const mangoSellerId = mango.seller?.id || mango.sellerId || null
    if (cartSellerId && mangoSellerId && String(cartSellerId) !== String(mangoSellerId)) {
      const confirmed = window.confirm(
        `Your cart has items from "${cart[0]?.seller?.storeName || 'another store'}". ` +
        `Clear cart and add from "${mango.seller?.storeName || 'this store'}"?`
      )
      if (!confirmed) return
      clearCart()
    }
    addToCart({ ...mango, sellerId: mangoSellerId })
  }, [cartSellerId, cart, addToCart, clearCart])

  const handleSellerSelect = (s) => {
    setSelectedSeller(s)
    setSelectedCat('')
  }

  const sortedMangoes = [...mangoes].sort((a, b) => {
    if (sortBy === 'price_asc') return Number(a.price) - Number(b.price)
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price)
    if (sortBy === 'rating') return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0)
    return 0 // default server order
  })

  const hasActiveFilters = selectedCat || selectedSeller || search || sortBy !== 'default'

  const clearFilters = () => {
    setSelectedCat('')
    setSelectedSeller(null)
    setSearch('')
    setSortBy('default')
  }

  return (
    <>
      <style>{`
        .home-page {
          width: 100%;
          padding: 24px 32px 60px;
        }

        /* ── Hero ── */
        .hero {
          background: linear-gradient(135deg, #fef9ee 0%, #fef3c7 55%, #fde68a 100%);
          border-radius: 28px;
          padding: 48px 48px;
          margin-bottom: 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -60px;
          right: 120px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero-content { position: relative; z-index: 1; }
        .hero-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #b45309;
          margin-bottom: 12px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 800;
          color: #1c1917;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .hero-title em {
          color: #f59e0b;
          font-style: italic;
        }
        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #78716c;
          max-width: 420px;
          line-height: 1.65;
          margin-bottom: 24px;
        }
        .hero-stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .hero-stat {
          text-align: center;
        }
        .hero-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 800;
          color: #f59e0b;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 11px;
          color: #a8a29e;
          font-family: 'DM Sans', sans-serif;
          margin-top: 2px;
        }
        .hero-emoji {
          font-size: clamp(80px, 12vw, 140px);
          line-height: 1;
          filter: drop-shadow(0 12px 32px rgba(245,158,11,0.3));
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          animation: floatMango 4s ease-in-out infinite;
        }
        @keyframes floatMango {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }

        /* ── Login nudge ── */
        .login-nudge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: white;
          border: 1.5px solid #fde68a;
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .login-nudge-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #78716c;
        }
        .login-nudge-text strong { color: #1c1917; }

        /* ── Store picker ── */
        .store-section {
          margin-bottom: 20px;
        }
        .store-section-title {
          font-size: 12px;
          font-weight: 700;
          color: #a8a29e;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 10px;
        }
        .store-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .store-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 12px;
          border: 1.5px solid #e7e5e4;
          background: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #57534e;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .store-pill:hover {
          border-color: #f59e0b;
          color: #92400e;
          background: #fffbf0;
        }
        .store-pill.active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: white;
          box-shadow: 0 4px 12px rgba(245,158,11,0.3);
        }

        /* ── Filter bar ── */
        .filter-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 180px;
          max-width: 360px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a8a29e;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 10px 36px;
          border: 1.5px solid #e7e5e4;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          background: white;
          color: #1c1917;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
        }
        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #a8a29e;
          padding: 2px;
          display: flex;
          border-radius: 4px;
        }
        .search-clear:hover { color: #78716c; }

        .cat-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1;
        }
        .cat-pill {
          padding: 7px 14px;
          border-radius: 12px;
          border: 1.5px solid #e7e5e4;
          background: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #57534e;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .cat-pill:hover { border-color: #f59e0b; color: #92400e; }
        .cat-pill.active { background: #fef3c7; border-color: #f59e0b; color: #92400e; font-weight: 700; }

        /* Sort + filter toggle */
        .filter-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .sort-select {
          padding: 8px 12px;
          border: 1.5px solid #e7e5e4;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #57534e;
          background: white;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s;
        }
        .sort-select:focus { border-color: #f59e0b; }

        /* Active filters summary */
        .active-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .active-filter-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #92400e;
          font-family: 'DM Sans', sans-serif;
        }
        .chip-remove {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          color: #b45309;
        }
        .clear-all-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: #dc2626;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* ── Grid ── */
        .mango-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 22px;
        }

        /* ── Empty / loading states ── */
        .state-box {
          text-align: center;
          padding: 80px 24px;
          grid-column: 1 / -1;
        }
        .state-emoji { font-size: 64px; margin-bottom: 16px; }
        .state-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #1c1917;
          margin-bottom: 8px;
        }
        .state-sub { font-size: 14px; color: #a8a29e; font-family: 'DM Sans', sans-serif; }

        /* Loading skeleton */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 22px;
        }
        .skeleton-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #f0ede8;
        }
        .skeleton-img {
          height: 210px;
          background: linear-gradient(90deg, #f5f5f4 25%, #e7e5e4 50%, #f5f5f4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-line {
          height: 14px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f5f5f4 25%, #e7e5e4 50%, #f5f5f4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Cart conflict banner ── */
        .cart-conflict-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #fff7ed;
          border: 1.5px solid #fed7aa;
          border-radius: 12px;
          margin-bottom: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #9a3412;
          flex-wrap: wrap;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .home-page { padding: 20px 24px 56px; }
          .hero { padding: 40px 36px; }
        }
        @media (max-width: 768px) {
          .home-page { padding: 16px 16px 48px; }
          .hero {
            padding: 28px 24px;
            flex-direction: column-reverse;
            text-align: center;
            gap: 8px;
            border-radius: 20px;
            margin-bottom: 24px;
          }
          .hero-emoji { font-size: 80px; animation: none; }
          .hero-sub { max-width: 100%; }
          .hero-stats { justify-content: center; }
          .mango-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
          .skeleton-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
          .filter-bar { gap: 8px; }
          .search-wrap { max-width: 100%; }
        }
        @media (max-width: 540px) {
          .hero { padding: 22px 18px; border-radius: 16px; }
          .hero-emoji { font-size: 64px; }
          .hero::before { display: none; }
          .mango-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .skeleton-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .filter-bar { flex-direction: column; align-items: stretch; }
          .search-wrap { max-width: 100%; }
          .cat-pills { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; scrollbar-width: none; }
          .cat-pills::-webkit-scrollbar { display: none; }
          .store-pills { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; scrollbar-width: none; }
          .store-pills::-webkit-scrollbar { display: none; }
          .filter-actions { flex-direction: row; justify-content: flex-end; }
        }
        @media (max-width: 360px) {
          .mango-grid { grid-template-columns: 1fr; }
          .skeleton-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="home-page">

        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-content">
            <p className="hero-eyebrow">🌿 Fresh from the Farm</p>
            <h1 className="hero-title">
              India's Finest<br />
              <em>Mangoes</em> 🥭
            </h1>
            <p className="hero-sub">
              Premium quality mangoes sourced directly from the best orchards.
              Sweet, juicy, and delivered right to your door.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">{mangoes.length}+</div>
                <div className="hero-stat-label">Varieties</div>
              </div>
              {sellers.length > 0 && (
                <div className="hero-stat">
                  <div className="hero-stat-num">{sellers.length}</div>
                  <div className="hero-stat-label">Stores</div>
                </div>
              )}
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-label">Fresh</div>
              </div>
            </div>
          </div>
          <div className="hero-emoji">🥭</div>
        </div>

        {/* ── Login nudge for guests ── */}
        {!isCustomer && (
          <div className="login-nudge">
            <div className="login-nudge-text">
              <LogIn size={16} color="#f59e0b" />
              <span><strong>Login</strong> to save your orders and track them anytime!</span>
            </div>
            <Link to="/user/login">
              <button style={{
                background: '#f59e0b', color: 'white', border: 'none', borderRadius: 10,
                padding: '7px 16px', fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                Login / Register
              </button>
            </Link>
          </div>
        )}

        {/* ── Cart store conflict warning ── */}
        {cartSellerId && cart?.length > 0 && (
          <div className="cart-conflict-banner">
            <Store size={15} />
            <span>
              You have items from <strong>{cart[0]?.seller?.storeName || 'a store'}</strong> in your cart.
              Adding items from another store will clear your current cart.
            </span>
          </div>
        )}

        {/* ── Store picker (only show if multiple sellers) ── */}
        {sellers.length > 1 && (
          <div className="store-section">
            <p className="store-section-title">Browse by Store</p>
            <div className="store-pills">
              <button
                className={`store-pill ${!selectedSeller ? 'active' : ''}`}
                onClick={() => handleSellerSelect(null)}
              >
                <Store size={13} /> All Stores
              </button>
              {sellers.map(s => (
                <button
                  key={s.id}
                  className={`store-pill ${selectedSeller?.id === s.id ? 'active' : ''}`}
                  onClick={() => handleSellerSelect(s)}
                >
                  🏪 {s.storeName}
                  {s.city && <span style={{ opacity: 0.7, fontSize: 11 }}> · {s.city}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter bar ── */}
        <div className="filter-bar">
          {/* Search */}
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search mangoes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="cat-pills">
              <button
                className={`cat-pill ${selectedCat === '' ? 'active' : ''}`}
                onClick={() => setSelectedCat('')}
              >All</button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-pill ${selectedCat === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCat(selectedCat === cat ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="filter-actions">
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ── Active filters chips ── */}
        {hasActiveFilters && (
          <div className="active-filters">
            {selectedSeller && (
              <span className="active-filter-chip">
                <Store size={11} /> {selectedSeller.storeName}
                <button className="chip-remove" onClick={() => setSelectedSeller(null)}>
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedCat && (
              <span className="active-filter-chip">
                {selectedCat}
                <button className="chip-remove" onClick={() => setSelectedCat('')}>
                  <X size={11} />
                </button>
              </span>
            )}
            {search && (
              <span className="active-filter-chip">
                "{search}"
                <button className="chip-remove" onClick={() => setSearch('')}>
                  <X size={11} />
                </button>
              </span>
            )}
            {sortBy !== 'default' && (
              <span className="active-filter-chip">
                {sortBy === 'price_asc' ? 'Price ↑' : sortBy === 'price_desc' ? 'Price ↓' : 'Top Rated'}
                <button className="chip-remove" onClick={() => setSortBy('default')}>
                  <X size={11} />
                </button>
              </span>
            )}
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}

        {/* ── Results count ── */}
        {!loading && mangoes.length > 0 && (
          <p style={{
            fontFamily: 'DM Sans', fontSize: 13, color: '#a8a29e',
            marginBottom: 16, paddingLeft: 2
          }}>
            Showing {sortedMangoes.length} mango{sortedMangoes.length !== 1 ? 'es' : ''}
            {selectedSeller ? ` from ${selectedSeller.storeName}` : ''}
          </p>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width: '70%' }} />
                  <div className="skeleton-line" style={{ width: '40%' }} />
                  <div className="skeleton-line" style={{ width: '90%' }} />
                  <div className="skeleton-line" style={{ width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && sortedMangoes.length === 0 && (
          <div className="mango-grid">
            <div className="state-box">
              <div className="state-emoji">
                {search ? '🔍' : selectedSeller ? '🏪' : '😔'}
              </div>
              <h2 className="state-title">
                {search
                  ? `No results for "${search}"`
                  : selectedSeller
                    ? `No mangoes at ${selectedSeller.storeName} yet`
                    : 'No mangoes available'}
              </h2>
              <p className="state-sub">
                {search
                  ? 'Try a different keyword or browse all categories'
                  : 'Check back soon — fresh stock is on the way!'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: 20, padding: '10px 22px', background: '#f59e0b',
                    color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Mango grid ── */}
        {!loading && sortedMangoes.length > 0 && (
          <div className="mango-grid">
            {sortedMangoes.map((m, i) => (
              <div
                key={m.id}
                style={{
                  animation: 'fadeSlideUp 0.35s ease both',
                  animationDelay: `${Math.min(i * 0.05, 0.4)}s`
                }}
              >
                <MangoCard
                  mango={m}
                  addToCart={handleAddToCart}
                  onRateClick={setRatingMango}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Rating modal ── */}
        {ratingMango && (
          <RatingModal
            mango={ratingMango}
            reviewerName={isCustomer ? user?.name : ''}
            reviewerPhone={isCustomer ? user?.mobile : ''}
            onClose={() => {
              setRatingMango(null)
              // Refresh mangoes to update rating count
              const params = { category: selectedCat, search }
              if (selectedSeller) params.sellerId = selectedSeller.id
              mangoAPI.getAll(params).then(r => setMangoes(r.data)).catch(() => { })
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}