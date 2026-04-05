import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI, mangoAPI, notificationAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import {
  Package, ShoppingBag, TrendingUp, Clock, CheckCircle,
  Bell, IndianRupee, ArrowRight, RefreshCw, Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#d1fae5', text: '#065f46' },
  PROCESSING: { bg: '#dbeafe', text: '#1e40af' },
  SHIPPED: { bg: '#ede9fe', text: '#5b21b6' },
  DELIVERED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
}
const PAY_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  PAID: { bg: '#dcfce7', text: '#166534' },
  FAILED: { bg: '#fee2e2', text: '#991b1b' },
  REFUNDED: { bg: '#ede9fe', text: '#5b21b6' },
}

export default function SellerDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [mangoCount, setMangoCount] = useState(null)
  const [unread, setUnread] = useState(0)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const sseRef = useRef(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      // FIX Bug 11 (frontend side): pass sellerId so we only get this seller's mangoes
      const sellerId = user?.sellerId
      const [statsRes, ordersRes, unreadRes, mangoRes] = await Promise.all([
        orderAPI.getStats(),
        orderAPI.getAll({ sortBy: 'createdAt', sortDir: 'desc' }),
        notificationAPI.getUnreadCount(),
        sellerId
          ? mangoAPI.getAll({ adminView: true, sellerId })
          : Promise.resolve({ data: [] }),
      ])
      setStats(statsRes.data)
      setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 10) : [])
      setUnread(unreadRes.data.count || 0)
      setMangoCount(Array.isArray(mangoRes.data) ? mangoRes.data.length : 0)
      setLastRefresh(new Date())
    } catch (err) {
      // Silently fail individual stat errors — show stale data rather than crash
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  // SSE for real-time order notifications
  useEffect(() => {
    loadAll()
    const token = localStorage.getItem('sellerToken')
    if (!token) return

    const es = new EventSource(
      `${import.meta.env.VITE_API_URL}/notifications/stream?token=${token}`
    )
    sseRef.current = es

    es.addEventListener('new-order', (e) => {
      try {
        const data = JSON.parse(e.data)
        toast.custom(() => (
          <div style={{
            background: '#166534', color: 'white', borderRadius: 16,
            padding: '16px 20px', maxWidth: 360,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Bell size={18} style={{ color: '#86efac', flexShrink: 0 }} />
              <strong style={{ fontSize: 15 }}>🥭 New Order!</strong>
            </div>
            <p style={{ fontSize: 13, opacity: 0.9, margin: '0 0 3px' }}>
              <strong>{data.customerName}</strong> — {data.customerPhone}
            </p>
            <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>
              #{data.orderNumber} · ₹{data.total}
            </p>
          </div>
        ), { duration: 10000, position: 'top-right' })

        setUnread(u => u + 1)
        loadAll()
      } catch { }
    })

    es.onerror = () => { es.close() }
    return () => { es.close() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async () => {
    try {
      await notificationAPI.markRead()
      setUnread(0)
      toast.success('Notifications cleared')
    } catch { toast.error('Failed to clear notifications') }
  }

  const markDelivered = async (orderId) => {
    if (!window.confirm('Mark this order as Delivered?')) return
    try {
      await orderAPI.markDelivered(orderId)
      toast.success('Marked as delivered ✅')
      loadAll()
    } catch { toast.error('Failed to update') }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, { status })
      toast.success('Status updated!')
      loadAll()
    } catch { toast.error('Failed to update status') }
  }

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: '#166534', bg: '#dcfce7' },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#7c3aed', bg: '#ede9fe' },
    { label: "Today's Revenue", value: `₹${Number(stats.todayRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: '#0891b2', bg: '#e0f2fe' },
    { label: 'My Mangoes', value: mangoCount ?? '…', icon: Package, color: '#10b981', bg: '#d1fae5' },
  ] : []

  return (
    <div className="page">
      <style>{`
        .seller-dash-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
        .seller-stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; margin-bottom:24px; }
        .seller-orders-table { width:100%; border-collapse:collapse; font-size:13px; min-width:680px; }
        .orders-wrap { overflow-x:auto; }
        .status-select { padding:4px 8px; border-radius:8px; border:1px solid #e7e5e4; font-family:'DM Sans',sans-serif; font-size:12px; cursor:pointer; }
        @media(max-width:640px){
          .seller-stat-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
          .seller-dash-header { flex-direction:column; gap:10px; }
        }
      `}</style>

      {/* Header */}
      <div className="seller-dash-header">
        <div>
          <h1 className="section-title">{user?.storeName || 'My Store'} 🏪</h1>
          <p style={{ color: '#78716c', fontSize: 13 }}>
            Last refreshed: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Notification bell */}
          <button onClick={markRead} style={{
            position: 'relative', background: unread > 0 ? '#fef3c7' : 'white',
            border: `2px solid ${unread > 0 ? '#f59e0b' : '#e7e5e4'}`,
            borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14,
            color: unread > 0 ? '#92400e' : '#78716c',
          }}>
            <Bell size={17} />
            {unread > 0 ? `${unread} New` : 'Notifications'}
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -7,
                background: '#dc2626', color: 'white', borderRadius: '50%',
                width: 20, height: 20, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 700,
              }}>{unread}</span>
            )}
          </button>

          <button onClick={loadAll} className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <Link to="/seller/mangoes">
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add Mango
            </button>
          </Link>

          <button
            onClick={() => logout('/seller/login')}
            className="btn btn-outline"
            style={{ color: '#dc2626', borderColor: '#dc2626' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="seller-stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: '#78716c', fontSize: 11, fontWeight: 600, marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: 0.5
                }}>{s.label}</p>
                <p style={{
                  fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 800,
                  color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {s.value ?? '—'}
                </p>
              </div>
              <div style={{ background: s.bg, padding: 8, borderRadius: 10, flexShrink: 0, marginLeft: 8 }}>
                <s.icon size={17} style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1px solid #f5f5f4'
        }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>Recent Orders</h3>
          {/* FIX Bug 9: /seller/orders doesn't exist — link to seller mangoes page instead,
              or simply remove the broken link. Full order list is this same table. */}
          <Link to="/seller/mangoes" style={{
            color: '#f59e0b', fontSize: 13, textDecoration: 'none',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
          }}>
            Manage Mangoes <ArrowRight size={14} />
          </Link>
        </div>

        <div className="orders-wrap">
          <table className="seller-orders-table">
            <thead style={{ background: '#fafaf9' }}>
              <tr>
                {['Order #', 'Customer', 'Phone', 'Items', 'Amount', 'Payment', 'Status', 'Action'].map(h => (
                  <th key={h} style={{
                    padding: '11px 14px', textAlign: 'left', color: '#78716c',
                    fontWeight: 600, borderBottom: '2px solid #e7e5e4', whiteSpace: 'nowrap', fontSize: 12
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} style={{
                  borderBottom: '1px solid #f5f5f4',
                  background: o.isNewNotification ? '#fffbf0' : 'white'
                }}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {o.isNewNotification && (
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%', background: '#dc2626',
                          display: 'inline-block', flexShrink: 0
                        }} />
                      )}
                      <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 12 }}>{o.orderNumber}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{o.customerName}</td>
                  <td style={{ padding: '11px 14px', color: '#78716c', whiteSpace: 'nowrap' }}>{o.customerPhone}</td>
                  <td style={{ padding: '11px 14px', color: '#78716c' }}>
                    {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: '#166534', whiteSpace: 'nowrap' }}>
                    ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      ...(PAY_COLORS[o.paymentStatus] || PAY_COLORS.PENDING)
                    }}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {o.status === 'DELIVERED' || o.status === 'CANCELLED' ? (
                      <span style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 11,
                        fontWeight: 700, ...(STATUS_COLORS[o.status])
                      }}>
                        {o.status}
                      </span>
                    ) : (
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.text }}>
                        {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                      <button
                        onClick={() => markDelivered(o.id)}
                        style={{
                          background: '#166534', color: 'white', border: 'none', borderRadius: 8,
                          padding: '5px 10px', fontSize: 11, cursor: 'pointer',
                          fontFamily: 'DM Sans', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                        }}>
                        <CheckCircle size={12} /> Deliver
                      </button>
                    )}
                    {o.status === 'DELIVERED' && (
                      <span style={{ color: '#166534', fontSize: 12, fontWeight: 600 }}>✅ Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentOrders.length === 0 && !loading && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#78716c' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p style={{ fontWeight: 600 }}>No orders yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Share your store link to start receiving orders!</p>
            </div>
          )}
          {loading && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#78716c' }}>
              Loading orders…
            </div>
          )}
        </div>
      </div>

      {/* Change password nudge */}
      {user && user.passwordChanged === false && (
        <div style={{
          marginTop: 20, background: '#fff7ed', border: '1.5px solid #fed7aa',
          borderRadius: 14, padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#9a3412', margin: 0 }}>
            ⚠️ You are using the default password. Please change it for security.
          </p>
          <Link to="/seller/change-password">
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Change Password
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}