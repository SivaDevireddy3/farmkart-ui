import { useState, useEffect } from 'react'
import { imageUrl as buildImgUrl } from '../api'
import { ShoppingCart, Star, MapPin, Store, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MangoCard({ mango, addToCart, onRateClick }) {
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Reset error state when imageUrl changes (e.g. list re-renders with different mango)
  useEffect(() => {
    setImgError(false)
  }, [mango.imageUrl])

  const isOutOfStock = !mango.isAvailable || mango.stock === 0
  const isLowStock = mango.stock > 0 && mango.stock <= 5 && mango.isAvailable

  const handleAdd = () => {
    if (isOutOfStock) return
    addToCart(mango)
    toast.success(`${mango.name} added! 🥭`, { duration: 2000 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // Build correct image src — handle relative /uploads/ paths and absolute URLs
  const imgSrc = buildImgUrl(mango.imageUrl)

  const avgRating = Number(mango.avgRating) || 0
  const reviewCount = mango.reviewCount || 0

  return (
    <>
      <style>{`
        .mango-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #f0ede8;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.22s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .mango-card:not(.out-of-stock):hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
        }
        .mango-card.out-of-stock {
          opacity: 0.82;
        }

        .mango-img-wrap {
          position: relative;
          height: 210px;
          background: linear-gradient(145deg, #fef9ee, #fef3c7);
          overflow: hidden;
          flex-shrink: 0;
        }
        .mango-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .mango-card:hover .mango-img {
          transform: scale(1.04);
        }
        .mango-img-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 84px;
          filter: drop-shadow(0 4px 12px rgba(245,158,11,0.2));
          user-select: none;
        }

        /* Category pill */
        .mango-cat-pill {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          color: #92400e;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          border: 1px solid rgba(245,158,11,0.2);
        }

        /* Out of stock overlay */
        .mango-oos-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mango-oos-badge {
          background: #dc2626;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(220,38,38,0.35);
        }

        /* Body */
        .mango-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .mango-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #1c1917;
          line-height: 1.25;
          margin: 0;
        }

        .mango-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .mango-meta-tag {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          color: #78716c;
          font-family: 'DM Sans', sans-serif;
        }

        .mango-desc {
          font-size: 12.5px;
          color: #a8a29e;
          line-height: 1.5;
          font-family: 'DM Sans', sans-serif;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Stars */
        .mango-stars {
          display: flex;
          align-items: center;
          gap: 3px;
          flex-wrap: wrap;
        }
        .star-icon {
          font-size: 13px;
          line-height: 1;
          transition: transform 0.1s;
        }
        .star-icon.filled { color: #f59e0b; }
        .star-icon.half   { color: #fcd34d; }
        .star-icon.empty  { color: #e7e5e4; }
        .mango-rating-count {
          font-size: 11px;
          color: #a8a29e;
          font-family: 'DM Sans', sans-serif;
        }
        .rate-btn {
          font-size: 11px;
          color: #f59e0b;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* Footer */
        .mango-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px 16px;
          gap: 8px;
          margin-top: auto;
        }
        .mango-price-block {}
        .mango-price {
          font-size: 20px;
          font-weight: 800;
          color: #166534;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
        }
        .mango-unit {
          font-size: 11px;
          color: #a8a29e;
          font-family: 'DM Sans', sans-serif;
          margin-top: 1px;
        }

        /* Add button */
        .mango-add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 13px;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mango-add-btn:hover:not(:disabled) {
          background: #d97706;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245,158,11,0.4);
        }
        .mango-add-btn:active:not(:disabled) { transform: scale(0.96); }
        .mango-add-btn.added {
          background: #166534;
        }
        .mango-add-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Low stock */
        .mango-low-stock {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #fff7ed;
          border-radius: 0 0 18px 18px;
          border-top: 1px solid #fed7aa;
        }
        .mango-low-stock span {
          font-size: 11px;
          color: #c2410c;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        /* Store badge */
        .mango-store-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #78716c;
          font-family: 'DM Sans', sans-serif;
          background: #f5f5f4;
          padding: 2px 8px;
          border-radius: 8px;
        }

        @media (max-width: 480px) {
          .mango-img-wrap { height: 175px; }
          .mango-img-placeholder { font-size: 68px; }
          .mango-card-body { padding: 12px; gap: 5px; }
          .mango-name { font-size: 15px; }
          .mango-card-footer { padding: 0 12px 12px; }
          .mango-price { font-size: 17px; }
          .mango-add-btn { padding: 7px 12px; font-size: 12px; }
        }
      `}</style>

      <div className={`mango-card${isOutOfStock ? ' out-of-stock' : ''}`}>

        {/* Image */}
        <div className="mango-img-wrap">
          {imgSrc && !imgError ? (
            <img
              src={imgSrc}
              alt={mango.name}
              className="mango-img"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="mango-img-placeholder">🥭</div>
          )}

          {/* Category pill */}
          {mango.category && (
            <span className="mango-cat-pill">{mango.category}</span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="mango-oos-overlay">
              <span className="mango-oos-badge">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="mango-card-body">
          <h3 className="mango-name">{mango.name}</h3>

          {/* Meta: origin + store */}
          <div className="mango-meta">
            {mango.origin && (
              <span className="mango-meta-tag">
                <MapPin size={11} /> {mango.origin}
              </span>
            )}
            {mango.seller?.storeName && (
              <span className="mango-store-badge">
                <Store size={10} /> {mango.seller.storeName}
              </span>
            )}
          </div>

          {/* Description */}
          {mango.description && (
            <p className="mango-desc">{mango.description}</p>
          )}

          {/* Stars / rating */}
          <div className="mango-stars">
            {avgRating > 0 ? (
              <>
                {[1, 2, 3, 4, 5].map(s => {
                  const filled = s <= Math.floor(avgRating)
                  const half = !filled && s - 0.5 <= avgRating
                  return (
                    <span key={s} className={`star-icon ${filled ? 'filled' : half ? 'half' : 'empty'}`}>
                      ★
                    </span>
                  )
                })}
                <span className="mango-rating-count">
                  {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
              </>
            ) : (
              <span className="mango-rating-count">No reviews yet</span>
            )}
            {onRateClick && !isOutOfStock && (
              <button className="rate-btn" onClick={() => onRateClick(mango)}>
                Rate
              </button>
            )}
          </div>
        </div>

        {/* Footer: price + add */}
        <div className="mango-card-footer">
          <div className="mango-price-block">
            <div className="mango-price">₹{Number(mango.price).toLocaleString('en-IN')}</div>
            <div className="mango-unit">per {mango.unit || 'kg'}</div>
          </div>

          {isOutOfStock ? (
            <button className="mango-add-btn" disabled>
              <AlertCircle size={14} /> Sold Out
            </button>
          ) : (
            <button
              className={`mango-add-btn${added ? ' added' : ''}`}
              onClick={handleAdd}
            >
              {added ? (
                <>✓ Added!</>
              ) : (
                <><ShoppingCart size={14} /> Add</>
              )}
            </button>
          )}
        </div>

        {/* Low stock warning */}
        {isLowStock && (
          <div className="mango-low-stock">
            <AlertCircle size={11} color="#c2410c" />
            <span>Only {mango.stock} left!</span>
          </div>
        )}
      </div>
    </>
  )
}