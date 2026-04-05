import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Package, ChevronDown, ChevronUp, MapPin, Phone, Mail, ShoppingBag, Clock } from 'lucide-react'

const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  CONFIRMED: { bg: '#d1fae5', text: '#065f46', label: 'Confirmed' },
  PROCESSING: { bg: '#dbeafe', text: '#1e40af', label: 'Processing' },
  SHIPPED: { bg: '#ede9fe', text: '#5b21b6', label: 'Shipped' },
  DELIVERED: { bg: '#dcfce7', text: '#166534', label: 'Delivered' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
}
const PAY_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e', label: 'Unpaid' },
  PAID: { bg: '#d1fae5', text: '#065f46', label: 'Paid' },
  FAILED: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
  REFUNDED: { bg: '#ede9fe', text: '#5b21b6', label: 'Refunded' },
}

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function OrderTimeline({ status }) {
  const cancelled = status === 'CANCELLED'
  const currentIdx = STEPS.indexOf(status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '12px 0', overflowX: 'auto', paddingBottom: 4 }}>
      {STEPS.map((step, i) => {
        const done = !cancelled && i <= currentIdx
        const active = !cancelled && i === currentIdx
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
                background: cancelled ? '#fee2e2' : done ? '#f59e0b' : '#f5f5f4',
                color: cancelled ? '#991b1b' : done ? 'white' : '#a8a29e',
                border: active ? '2px solid #d97706' : '2px solid transparent',
                boxShadow: active ? '0 0 0 3px rgba(245,158,11,0.2)' : 'none',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 10, fontFamily: 'DM Sans', fontWeight: active ? 700 : 500,
                color: done ? '#92400e' : '#a8a29e', whiteSpace: 'nowrap',
                textTransform: 'capitalize', letterSpacing: 0.2,
              }}>
                {step.toLowerCase()}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 4px', marginBottom: 18,
                background: done && i < currentIdx ? '#f59e0b' : '#e7e5e4',
                transition: 'background 0.2s',
              }} />
            )}
          </div>
        )
      })}
      {cancelled && (
        <div style={{
          marginLeft: 12, padding: '3px 12px', background: '#fee2e2', color: '#991b1b',
          borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans', flexShrink: 0,
        }}>
          Cancelled
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const status = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING
  const pay = PAY_COLORS[order.paymentStatus] || PAY_COLORS.PENDING
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : ''

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px', cursor: 'pointer', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          background: open ? '#fffbf0' : 'white', transition: 'background 0.15s',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: '#fef3c7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>🥭</div>
          <div>
            <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, color: '#1c1917' }}>
              #{order.orderNumber}
            </p>
            <p style={{ fontSize: 12, color: '#78716c', fontFamily: 'DM Sans', marginTop: 1 }}>{date}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 16, color: '#166534' }}>
            ₹{Number(order.totalAmount).toLocaleString('en-IN')}
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: status.bg, color: status.text, fontFamily: 'DM Sans',
          }}>{status.label}</span>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: pay.bg, color: pay.text, fontFamily: 'DM Sans',
          }}>{pay.label}</span>
          {open ? <ChevronUp size={16} color="#a8a29e" /> : <ChevronDown size={16} color="#a8a29e" />}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f5f5f4' }}>
          {/* Progress */}
          <OrderTimeline status={order.status} />

          {/* Items */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#a8a29e', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans', marginBottom: 8 }}>
              Items
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: '#fafaf9', borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🥭</span>
                    <div>
                      <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#1c1917' }}>
                        {item.mango?.name || item.mangoName || 'Mango'}
                      </p>
                      <p style={{ fontSize: 11, color: '#78716c', fontFamily: 'DM Sans' }}>
                        ₹{Number(item.unitPrice).toLocaleString('en-IN')} × {item.quantity} {item.mango?.unit || 'kg'}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontWeight: 700, color: '#166534', fontSize: 13 }}>
                    ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans', marginBottom: 6 }}>
                Delivery Address
              </p>
              <p style={{ fontSize: 13, color: '#44403c', fontFamily: 'DM Sans', lineHeight: 1.5 }}>
                {order.deliveryAddress}
                {order.landmark && `, ${order.landmark}`}
                {order.city && `, ${order.city}`}
                {order.pincode && ` - ${order.pincode}`}
              </p>
            </div>
            <div style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans', marginBottom: 6 }}>
                Payment
              </p>
              <p style={{ fontSize: 13, color: '#44403c', fontFamily: 'DM Sans' }}>
                {order.paymentMethod === 'RAZORPAY' ? '💳 Razorpay' :
                  order.paymentMethod === 'COD' ? '💵 Cash on Delivery' :
                    order.paymentMethod === 'UPI' ? '📱 UPI' : order.paymentMethod}
              </p>
              {order.upiTransactionId && (
                <p style={{ fontSize: 11, color: '#78716c', fontFamily: 'DM Sans', marginTop: 4 }}>
                  Txn: {order.upiTransactionId}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <Link to={`/track?order=${order.orderNumber}`}>
              <button style={{
                background: 'none', border: '1.5px solid #f59e0b', color: '#d97706',
                padding: '7px 16px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Package size={14} /> Track Order
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyOrders() {
  const { isCustomer } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isCustomer) return
    orderAPI.getMyOrders()
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [isCustomer])

  if (!isCustomer) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 64 }}>🔐</div>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, margin: '16px 0 8px' }}>Login to view orders</h2>
      <p style={{ color: '#78716c', marginBottom: 24 }}>Your order history is saved when you're logged in.</p>
      <Link to="/user/login"><button className="btn btn-primary">Login</button></Link>
    </div>
  )

  return (
    <div className="page">
      <style>{`
        .my-orders-wrap {
          max-width: 760px;
          margin: 0 auto;
        }
        @media (max-width: 540px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="my-orders-wrap">
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={28} color="#f59e0b" /> My Orders
          </h1>
          <p className="section-sub">Your complete order history</p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f5f5f4', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 14, width: '40%', borderRadius: 6, background: '#f5f5f4', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)' }} />
                    <div style={{ height: 11, width: '25%', borderRadius: 6, background: '#f5f5f4', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', color: '#991b1b', fontFamily: 'DM Sans' }}>
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: '#78716c', marginBottom: 24 }}>Your orders will appear here once you shop.</p>
            <Link to="/"><button className="btn btn-primary">Browse Mangoes 🥭</button></Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: '#a8a29e', fontFamily: 'DM Sans', marginBottom: 4 }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </p>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}