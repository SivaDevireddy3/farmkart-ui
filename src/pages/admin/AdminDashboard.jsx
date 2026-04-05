import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI, mangoAPI, notificationAPI } from '../../api'
import {
  Package, ShoppingBag, TrendingUp, Clock,
  CheckCircle, Bell, IndianRupee,
  ArrowRight, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [mangoCount, setMangoCount] = useState(0)
  const [unread, setUnread] = useState(0)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const sseRef = useRef(null)

  const loadAll = () => {
    orderAPI.getStats().then(r => setStats(r.data))
    orderAPI.getAll({ sortBy: 'createdAt', sortDir: 'desc' }).then(r => setRecentOrders(r.data.slice(0, 8)))
    mangoAPI.getAll({ adminView: true }).then(r => setMangoCount(r.data.length))
    notificationAPI.getUnreadCount().then(r => setUnread(r.data.count))
    setLastRefresh(new Date())
  }

  useEffect(() => {
    loadAll()
    const token = localStorage.getItem('adminToken')
    const es = new EventSource(`${import.meta.env.VITE_API_URL}/notifications/stream?token=${token}`)
    sseRef.current = es
    es.addEventListener('new-order', (e) => {
      try {
        const data = JSON.parse(e.data)
        toast.custom((t) => (
          <div style={{
            background: '#166534', color: 'white', borderRadius: 14,
            padding: '14px 20px', maxWidth: 340, boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Bell size={18} style={{ color: '#86efac' }} />
              <strong style={{ fontSize: 15 }}>🥭 New Order Received!</strong>
            </div>
            <p style={{ fontSize: 13, opacity: 0.9 }}><strong>{data.customerName}</strong> · {data.customerPhone}</p>
            <p style={{ fontSize: 13, opacity: 0.9 }}>Order #{data.orderNumber} · ₹{data.total}</p>
          </div>
        ), { duration: 8000, position: 'top-right' })
        setUnread(u => u + 1)
        loadAll()
      } catch { }
    })
    es.onerror = () => es.close()
    return () => es.close()
  }, [])

  const markRead = async () => {
    await notificationAPI.markRead()
    setUnread(0)
    toast.success('All notifications cleared')
  }

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: '#166534', bg: '#dcfce7' },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#7c3aed', bg: '#ede9fe' },
    { label: "Today's Revenue", value: `₹${Number(stats.todayRevenue).toLocaleString('en-IN')}`, icon: TrendingUp, color: '#0891b2', bg: '#e0f2fe' },
    { label: 'Total Mangoes', value: mangoCount, icon: Package, color: '#db2777', bg: '#fce7f3' },
  ] : []

  const pipelineCards = stats ? [
    { label: 'Confirmed', value: stats.confirmedOrders, color: '#10b981' },
    { label: 'Processing', value: stats.processingOrders, color: '#3b82f6' },
    { label: 'Shipped', value: stats.shippedOrders, color: '#8b5cf6' },
    { label: 'Cancelled', value: stats.cancelledOrders, color: '#dc2626' },
  ] : []

  return (
    <div className="page">
      <style>{`
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 12px; }
        .dash-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .pipeline-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .orders-table-wrap { overflow-x: auto; }
        .orders-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 700px; }

        @media (max-width: 768px) {
          .dash-header { flex-direction: column; gap: 16px; }
          .dash-actions { width: 100%; justify-content: flex-start; }
          .dash-actions a, .dash-actions button { flex: 1; text-align: center; justify-content: center; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .pipeline-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }

        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .pipeline-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-card-value { font-size: 22px !important; }
          .dash-actions { gap: 8px; }
        }
      `}</style>

      <div className="dash-header">
        <div>
          <h1 className="section-title">Dashboard 🥭</h1>
          <p style={{ color: '#78716c', fontSize: 13 }}>
            Last refreshed: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div className="dash-actions">
          <button onClick={markRead} style={{
            position: 'relative', background: unread > 0 ? '#fef3c7' : 'white',
            border: `2px solid ${unread > 0 ? '#f59e0b' : '#e7e5e4'}`,
            borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans',
            fontWeight: 600, fontSize: 14, color: unread > 0 ? '#92400e' : '#78716c',
          }}>
            <Bell size={18} />
            <span style={{ display: 'none' }} className="bell-text">{unread > 0 ? `${unread} New` : 'No new'}</span>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6, background: '#dc2626',
                color: 'white', borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>{unread}</span>
            )}
          </button>
          <button onClick={loadAll} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to="/admin/mangoes"><button className="btn btn-primary">+ Add Mango</button></Link>
          {/* <Link to="/admin/orders"><button className="btn btn-outline">All Orders</button></Link> */}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#78716c', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</p>
                <p className="stat-card-value" style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 800, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
              </div>
              <div style={{ background: s.bg, padding: 8, borderRadius: 10, flexShrink: 0, marginLeft: 8 }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="pipeline-grid">
        {pipelineCards.map(p => (
          <div key={p.label} style={{
            background: 'white', borderRadius: 12, padding: '12px 14px',
            border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 12, color: '#78716c', fontWeight: 500 }}>{p.label}</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: p.color }}>{p.value ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f5f5f4' }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ color: '#f59e0b', fontSize: 14, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead style={{ background: '#fafaf9' }}>
              <tr>
                {['Order #', 'Customer', 'Phone', 'City', 'Amount', 'Payment', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#78716c', fontWeight: 600, borderBottom: '2px solid #e7e5e4', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {o.isNewNotification && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />}
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>{o.orderNumber}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{o.customerName}</td>
                  <td style={{ padding: '12px 14px', color: '#78716c', whiteSpace: 'nowrap' }}>{o.customerPhone}</td>
                  <td style={{ padding: '12px 14px', color: '#78716c' }}>{o.city || '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#166534', whiteSpace: 'nowrap' }}>₹{o.totalAmount}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge badge-${o.paymentStatus?.toLowerCase()}`}>{o.paymentStatus}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge badge-${o.status?.toLowerCase()}`}>{o.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                      <QuickDeliverBtn orderId={o.id} onDone={loadAll} />
                    )}
                    {o.status === 'DELIVERED' && <span style={{ color: '#166534', fontSize: 12, fontWeight: 600 }}>✅ Done</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#78716c' }}>No orders yet. Share your store link!</div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickDeliverBtn({ orderId, onDone }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    if (!window.confirm('Mark this order as Delivered?')) return
    setLoading(true)
    try {
      await orderAPI.markDelivered(orderId)
      toast.success('Marked as delivered! ✅')
      onDone()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }
  return (
    <button onClick={handle} disabled={loading} style={{
      background: '#166534', color: 'white', border: 'none', borderRadius: 8,
      padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans',
      fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
      opacity: loading ? 0.6 : 1
    }}>
      <CheckCircle size={13} /> {loading ? '...' : 'Deliver'}
    </button>
  )
}