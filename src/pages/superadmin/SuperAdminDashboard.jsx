import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sellerAPI, orderAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Store, Users, ShoppingBag, TrendingUp, ArrowRight, RefreshCw, Plus, Eye } from 'lucide-react'

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const [sellers, setSellers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const loadAll = async () => {
    setLoading(true)
    try {
      const [sellersRes, statsRes] = await Promise.all([
        sellerAPI.getAll(),
        orderAPI.getStats().catch(() => ({ data: null }))
      ])
      setSellers(sellersRes.data)
      setStats(statsRes.data)
      setLastRefresh(new Date())
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const activeSellers = sellers.filter(s => s.isActive).length
  const inactiveSellers = sellers.length - activeSellers

  const overviewCards = [
    { label: 'Total Sellers', value: sellers.length, icon: Store, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Active Sellers', value: activeSellers, icon: Users, color: '#166534', bg: '#dcfce7' },
    { label: 'Inactive', value: inactiveSellers, icon: Store, color: '#dc2626', bg: '#fee2e2' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Total Revenue', value: stats ? `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}` : '—', icon: TrendingUp, color: '#0891b2', bg: '#e0f2fe' },
    { label: 'Today Revenue', value: stats ? `₹${Number(stats.todayRevenue || 0).toLocaleString('en-IN')}` : '—', icon: TrendingUp, color: '#f59e0b', bg: '#fef3c7' },
  ]

  return (
    <div className="page">
      <style>{`
        .sa-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
        .sa-stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; margin-bottom:28px; }
        .sa-seller-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
        @media(max-width:640px){
          .sa-stat-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
        }
      `}</style>

      {/* Header */}
      <div className="sa-header">
        <div>
          <h1 className="section-title">Super Admin 🛡️</h1>
          <p style={{ color: '#78716c', fontSize: 13 }}>
            Welcome, {user?.username || 'Admin'} · Last updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={loadAll} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <Link to="/super-admin/sellers">
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add Seller
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="sa-stat-grid">
        {overviewCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#78716c', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {s.label}
                </p>
                <p style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 800, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.value}
                </p>
              </div>
              <div style={{ background: s.bg, padding: 8, borderRadius: 10, flexShrink: 0, marginLeft: 8 }}>
                <s.icon size={17} style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sellers overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>All Sellers</h2>
        <Link to="/super-admin/sellers" style={{ color: '#f59e0b', fontSize: 13, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          Manage All <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#78716c' }}>Loading sellers...</div>
      ) : sellers.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>No Sellers Yet</h3>
          <p style={{ color: '#78716c', marginBottom: 24 }}>Add your first mango seller to get started.</p>
          <Link to="/super-admin/sellers">
            <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add First Seller
            </button>
          </Link>
        </div>
      ) : (
        <div className="sa-seller-grid">
          {sellers.map(s => (
            <div key={s.id} className="card" style={{ padding: 20 }}>
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.storeName}
                  </h3>
                  {s.ownerName && <p style={{ color: '#78716c', fontSize: 12, margin: '3px 0 0' }}>{s.ownerName}</p>}
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                  background: s.isActive ? '#dcfce7' : '#fee2e2',
                  color: s.isActive ? '#166534' : '#dc2626'
                }}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Info */}
              <div style={{ fontSize: 13, color: '#78716c', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span>📱 {s.mobile}</span>
                {s.city && <span>📍 {s.city}</span>}
                {s.email && <span>✉️ {s.email}</span>}
                <span style={{ fontSize: 11, marginTop: 4 }}>
                  Password: {s.passwordChanged
                    ? <span style={{ color: '#166534', fontWeight: 600 }}>✅ Changed</span>
                    : <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ Still default</span>
                  }
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/super-admin/sellers" style={{ flex: 1 }}>
                  <button className="btn btn-outline" style={{ width: '100%', padding: '7px 0', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Eye size={13} /> Manage
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}