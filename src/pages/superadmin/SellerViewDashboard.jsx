import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sellerAPI, mangoAPI, orderAPI, imageUrl as buildImgUrl } from '../../api'
import { ArrowLeft, Store, Package, Star, Phone, Mail, MapPin } from 'lucide-react'

export default function SellerViewDashboard() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [mangoes, setMangoes] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sid = Number(id)
    Promise.all([
      sellerAPI.getOne(sid),
      mangoAPI.getAll({ sellerId: sid, adminView: true }),
      orderAPI.getAll({ sellerId: sid }).catch(() => ({ data: [] })),
    ]).then(([sRes, mRes, oRes]) => {
      setSeller(sRes.data)
      setMangoes(Array.isArray(mRes.data) ? mRes.data : [])
      setOrders(Array.isArray(oRes.data) ? oRes.data : [])
    }).catch(() => { }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'DM Sans' }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <p style={{ color: '#78716c', marginTop: 12 }}>Loading seller dashboard...</p>
    </div>
  )

  if (!seller) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'DM Sans' }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h2 style={{ fontFamily: 'Playfair Display', marginBottom: 8 }}>Seller not found</h2>
      <Link to="/super-admin/sellers"><button className="btn btn-outline">← Back to Sellers</button></Link>
    </div>
  )

  const revenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const activeMangoCount = mangoes.filter(m => m.isAvailable && m.stock > 0).length

  return (
    <div className="page">
      <style>{`
        .sv-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .sv-back {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: white;
          border: 1.5px solid #e7e5e4;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #44403c;
          text-decoration: none;
          transition: border-color 0.15s;
          flex-shrink: 0;
        }
        .sv-back:hover { border-color: #f59e0b; color: #92400e; }
        .sv-store-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: #ede9fe;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #7c3aed;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px;
        }
        .sv-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .sv-stat-card {
          background: white;
          border: 1px solid #f0ede8;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
        .sv-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 800;
          color: #f59e0b;
          line-height: 1;
          margin-bottom: 4px;
        }
        .sv-stat-label {
          font-size: 12px;
          color: #a8a29e;
          font-family: 'DM Sans', sans-serif;
        }
        .sv-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1c1917;
          margin-bottom: 14px;
        }
        .sv-mango-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }
        .sv-mango-card {
          background: white;
          border: 1px solid #f0ede8;
          border-radius: 14px;
          overflow: hidden;
        }
        .sv-mango-img {
          height: 150px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 56px;
          overflow: hidden;
        }
        .sv-mango-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sv-mango-body { padding: 12px; }
        .sv-order-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #fafaf9;
          border-radius: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sv-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 28px;
        }
        @media (max-width: 640px) {
          .sv-info-grid { grid-template-columns: 1fr; }
          .sv-mango-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .sv-mango-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="sv-header">
        <Link to="/super-admin/sellers" className="sv-back">
          <ArrowLeft size={14} /> Back to Sellers
        </Link>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 800, color: '#1c1917', margin: 0 }}>
            {seller.storeName}
          </h1>
          <p style={{ color: '#78716c', fontSize: 13, fontFamily: 'DM Sans', marginTop: 2 }}>
            Admin view — seller dashboard
          </p>
        </div>
        <span className="sv-store-badge">🛡️ Admin Viewing</span>
      </div>

      {/* Seller info */}
      <div className="sv-info-grid">
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans', marginBottom: 10 }}>Store Info</p>
          <p style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 700, color: '#1c1917', marginBottom: 6 }}>{seller.storeName}</p>
          {seller.ownerName && <p style={{ fontSize: 13, color: '#78716c', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><Store size={12} /> {seller.ownerName}</p>}
          {seller.mobile && <p style={{ fontSize: 13, color: '#78716c', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><Phone size={12} /> {seller.mobile}</p>}
          {seller.email && <p style={{ fontSize: 13, color: '#78716c', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><Mail size={12} /> {seller.email}</p>}
          {seller.city && <p style={{ fontSize: 13, color: '#78716c', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} /> {seller.city}</p>}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans', marginBottom: 10 }}>Account Status</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontFamily: 'DM Sans', color: '#44403c' }}>Status</span>
              <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: seller.isActive ? '#dcfce7' : '#fee2e2', color: seller.isActive ? '#166534' : '#dc2626' }}>
                {seller.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontFamily: 'DM Sans', color: '#44403c' }}>Password</span>
              <span style={{ fontSize: 13, fontFamily: 'DM Sans', color: seller.passwordChanged ? '#166534' : '#d97706' }}>
                {seller.passwordChanged ? '✅ Changed' : '⚠️ Default'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontFamily: 'DM Sans', color: '#44403c' }}>Joined</span>
              <span style={{ fontSize: 13, fontFamily: 'DM Sans', color: '#78716c' }}>
                {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sv-stats">
        <div className="sv-stat-card">
          <div className="sv-stat-num">{mangoes.length}</div>
          <div className="sv-stat-label">Total Mangoes</div>
        </div>
        <div className="sv-stat-card">
          <div className="sv-stat-num">{activeMangoCount}</div>
          <div className="sv-stat-label">Active Listings</div>
        </div>
        <div className="sv-stat-card">
          <div className="sv-stat-num">{orders.length}</div>
          <div className="sv-stat-label">Total Orders</div>
        </div>
        <div className="sv-stat-card">
          <div className="sv-stat-num">{pendingOrders}</div>
          <div className="sv-stat-label">Pending Orders</div>
        </div>
        <div className="sv-stat-card">
          <div className="sv-stat-num">₹{revenue.toLocaleString('en-IN')}</div>
          <div className="sv-stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Mangoes */}
      <h2 className="sv-section-title">🥭 Mango Listings ({mangoes.length})</h2>
      {mangoes.length === 0 ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', marginBottom: 28 }}>
          <p style={{ color: '#a8a29e', fontFamily: 'DM Sans' }}>No mangoes added yet</p>
        </div>
      ) : (
        <div className="sv-mango-grid" style={{ marginBottom: 28 }}>
          {mangoes.map(m => {
            const imgSrc = buildImgUrl(m.imageUrl)
            const [imgErr, setImgErr] = useState(false)
            return (
              <div key={m.id} className="sv-mango-card">
                <div className="sv-mango-img">
                  {imgSrc && !imgErr
                    ? <img src={imgSrc} alt={m.name} onError={() => setImgErr(true)} />
                    : '🥭'}
                </div>
                <div className="sv-mango-body">
                  <p style={{ fontFamily: 'Playfair Display', fontSize: 15, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: '#78716c', fontFamily: 'DM Sans', marginBottom: 6 }}>{m.category} · {m.unit}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#166534', fontFamily: 'DM Sans' }}>₹{Number(m.price).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: m.isAvailable && m.stock > 0 ? '#dcfce7' : '#fee2e2', color: m.isAvailable && m.stock > 0 ? '#166534' : '#dc2626', fontWeight: 700, fontFamily: 'DM Sans' }}>
                      {m.isAvailable && m.stock > 0 ? `${m.stock} left` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent orders */}
      <h2 className="sv-section-title">📦 Recent Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ color: '#a8a29e', fontFamily: 'DM Sans' }}>No orders yet</p>
        </div>
      ) : (
        <div>
          {orders.slice(0, 10).map(o => (
            <div key={o.id} className="sv-order-row">
              <div>
                <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, color: '#1c1917' }}>#{o.orderNumber}</p>
                <p style={{ fontSize: 12, color: '#78716c', fontFamily: 'DM Sans' }}>{o.customerName} · {o.customerPhone}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'DM Sans', fontWeight: 700, color: '#166534', fontSize: 14 }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</span>
                <span style={{
                  padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans',
                  background: { PENDING: '#fef3c7', CONFIRMED: '#d1fae5', DELIVERED: '#dcfce7', CANCELLED: '#fee2e2', SHIPPED: '#ede9fe' }[o.status] || '#f5f5f4',
                  color: { PENDING: '#92400e', CONFIRMED: '#065f46', DELIVERED: '#166534', CANCELLED: '#991b1b', SHIPPED: '#5b21b6' }[o.status] || '#44403c',
                }}>{o.status}</span>
              </div>
            </div>
          ))}
          {orders.length > 10 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#a8a29e', fontFamily: 'DM Sans', marginTop: 8 }}>
              Showing 10 of {orders.length} orders
            </p>
          )}
        </div>
      )}
    </div>
  )
}