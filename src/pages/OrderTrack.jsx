import { useState } from 'react'
import { orderAPI } from '../api'

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const statusColor = { PENDING: '#f59e0b', CONFIRMED: '#10b981', PROCESSING: '#3b82f6', SHIPPED: '#8b5cf6', DELIVERED: '#166534', CANCELLED: '#dc2626' }

export default function OrderTrack() {
  const [orderNum, setOrderNum] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const track = async () => {
    if (!orderNum.trim()) return
    setLoading(true); setError('')
    try {
      const res = await orderAPI.track(orderNum.trim())
      setOrder(res.data)
    } catch {
      setError('Order not found. Check your order number.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const stepIdx = order ? statusSteps.indexOf(order.status) : -1

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 className="section-title">Track Your Order</h1>
      <p className="section-sub">Enter your order number to see status</p>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input value={orderNum} onChange={e => setOrderNum(e.target.value)}
            placeholder="e.g. MNG-1234567890" onKeyDown={e => e.key === 'Enter' && track()} />
          <button className="btn btn-primary" onClick={track} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </div>
        {error && <p style={{ color: '#dc2626', marginTop: 12, fontSize: 14 }}>{error}</p>}
      </div>

      {order && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>Order #{order.orderNumber}</h3>
              <p style={{ color: '#78716c', fontSize: 13, marginTop: 4 }}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
            </div>
            <div>
              <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              <span style={{ marginLeft: 8 }} className={`badge badge-${order.paymentStatus?.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {order.status !== 'CANCELLED' && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, overflowX: 'auto', padding: '8px 0' }}>
              {statusSteps.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: i <= stepIdx ? '#f59e0b' : '#e7e5e4',
                      color: i <= stepIdx ? 'white' : '#78716c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13
                    }}>{i < stepIdx ? '✓' : i + 1}</div>
                    <p style={{ fontSize: 10, marginTop: 4, color: i <= stepIdx ? '#92400e' : '#78716c', fontWeight: i === stepIdx ? 700 : 400, whiteSpace: 'nowrap' }}>
                      {step}
                    </p>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div style={{ width: 40, height: 2, background: i < stepIdx ? '#f59e0b' : '#e7e5e4', margin: '0 4px', marginBottom: 18 }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#fafaf9', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Items Ordered</p>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>{item.mango?.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>₹{item.totalPrice}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
            <span>Total Paid</span>
            <span style={{ color: '#166534' }}>₹{order.totalAmount}</span>
          </div>
        </div>
      )}
    </div>
  )
}