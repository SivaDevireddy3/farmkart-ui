import { useState, useEffect } from 'react'
import { orderAPI } from '../../api'
import toast from 'react-hot-toast'
import {
  Search, ChevronUp, ChevronDown, CheckCircle,
  Phone, MapPin, Mail, Package, Clock, Truck,
  RefreshCw, FileText, ChevronsUpDown, X
} from 'lucide-react'

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#d1fae5', text: '#065f46' },
  PROCESSING: { bg: '#dbeafe', text: '#1e40af' },
  SHIPPED: { bg: '#ede9fe', text: '#5b21b6' },
  DELIVERED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
}
const PAYMENT_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  PAID: { bg: '#dcfce7', text: '#166534' },
  FAILED: { bg: '#fee2e2', text: '#991b1b' },
  REFUNDED: { bg: '#ede9fe', text: '#5b21b6' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getAll({ status: statusFilter, search, sortBy, sortDir })
      setOrders(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter, sortBy, sortDir])

  const handleSearch = (e) => {
    e.preventDefault()
    load()
  }

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronsUpDown size={14} style={{ color: '#cbd5e1' }} />
    return sortDir === 'asc' ? <ChevronUp size={14} style={{ color: '#f59e0b' }} /> : <ChevronDown size={14} style={{ color: '#f59e0b' }} />
  }

  const markDelivered = async (id) => {
    if (!window.confirm('Mark this order as Delivered?')) return
    setUpdatingId(id)
    try {
      await orderAPI.markDelivered(id)
      toast.success('✅ Order marked as delivered!')
      load()
    } catch { toast.error('Failed to update') } finally { setUpdatingId(null) }
  }

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await orderAPI.updateStatus(id, { status })
      toast.success('Status updated!')
      load()
    } catch { toast.error('Failed') } finally { setUpdatingId(null) }
  }

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((s, o) => s + parseFloat(o.totalAmount), 0)

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="section-title">Orders 📦</h1>
          <p style={{ color: '#78716c' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
            {orders.length > 0 && statusFilter === '' && ` · ₹${totalRevenue.toLocaleString('en-IN')} revenue`}
          </p>
        </div>
        <button onClick={load} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Orders"
              style={{ paddingLeft: 38 }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setTimeout(load, 0) }}
              className="btn btn-outline" style={{ padding: '10px 12px' }}>
              <X size={16} />
            </button>
          )}
        </form>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['', ...ALL_STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                background: statusFilter === s ? '#f59e0b' : '#f5f5f4',
                color: statusFilter === s ? 'white' : '#78716c',
              }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#78716c', marginRight: 4 }}>Sort by :</span>
        {[
          { field: 'createdAt', label: 'Date' },
          { field: 'totalAmount', label: 'Amount' },
          { field: 'customerName', label: 'Name' },
        ].map(s => (
          <button key={s.field} onClick={() => toggleSort(s.field)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
              background: sortBy === s.field ? '#fef3c7' : 'white',
              color: sortBy === s.field ? '#92400e' : '#78716c',
              fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}>
            {s.label} <SortIcon field={s.field} />
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#78716c' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 60 }}>📭</div>
          <p style={{ color: '#78716c', marginTop: 12 }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map(o => (
            <div key={o.id} className="card" style={{
              overflow: 'hidden',
              border: o.isNewNotification ? '2px solid #f59e0b' : '1px solid #e7e5e4',
              background: o.isNewNotification ? '#fffbf0' : 'white'
            }}>
              {/* Order Header Row */}
              <div style={{
                padding: '16px 20px', display: 'flex', gap: 16,
                alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap'
              }}>
                {/* Left: identifiers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                  {o.isNewNotification && (
                    <span style={{
                      background: '#dc2626', color: 'white', fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap'
                    }}>NEW</span>
                  )}
                  <div>
                    <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 15 }}>{o.orderNumber}</span>
                    <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 1 }}>
                      {new Date(o.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium', timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{o.customerName}</p>
                    <p style={{ color: '#78716c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={12} /> {o.customerPhone}
                    </p>
                  </div>
                  {o.city && (
                    <p style={{ color: '#78716c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {o.city}{o.pincode ? ` - ${o.pincode}` : ''}
                    </p>
                  )}
                </div>

                {/* Right: amount + badges + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 800, color: '#166534' }}>
                    ₹{parseFloat(o.totalAmount).toLocaleString('en-IN')}
                  </span>
                  <StatusBadge status={o.paymentStatus} map={PAYMENT_COLORS} />
                  <StatusBadge status={o.status} map={STATUS_COLORS} />

                  {/* Quick status change */}
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    disabled={updatingId === o.id}
                    style={{
                      border: '1px solid #e7e5e4', borderRadius: 8,
                      padding: '6px 10px', fontSize: 13, width: 'auto',
                      background: 'white', cursor: 'pointer', fontFamily: 'DM Sans'
                    }}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* Mark Delivered button */}
                  {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                    <button
                      className="deliver-btn"
                      onClick={() => markDelivered(o.id)}
                      disabled={updatingId === o.id}
                      style={{
                        background: '#166534', color: 'white', border: 'none', borderRadius: 10,
                        padding: '8px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
                        whiteSpace: 'nowrap', opacity: updatingId === o.id ? 0.6 : 1
                      }}>
                      <CheckCircle size={14} />
                      {updatingId === o.id ? 'Updating...' : '✅ Delivered'}
                    </button>
                  )}
                  {o.status === 'DELIVERED' && o.deliveredAt && (
                    <span style={{ fontSize: 12, color: '#166534', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      ✅ {new Date(o.deliveredAt).toLocaleDateString('en-IN')}
                    </span>
                  )}

                  {/* Expand toggle */}
                  <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    style={{
                      background: 'none', border: '1px solid #e7e5e4', borderRadius: 8,
                      padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'DM Sans'
                    }}>
                    {expanded === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expanded === o.id ? 'Less' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === o.id && (
                <div style={{ borderTop: '1px solid #f5f5f4', padding: '20px 24px', background: '#fafaf9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>

                    {/* Customer Info */}
                    <div>
                      <p style={sectionLabelStyle}><Phone size={13} /> CONTACT</p>
                      <p style={infoStyle}><strong>{o.customerName}</strong></p>
                      <p style={infoStyle}>📱 {o.customerPhone}</p>
                      {o.customerEmail && <p style={infoStyle}>✉️ {o.customerEmail}</p>}
                    </div>

                    {/* Delivery Address */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={sectionLabelStyle}><MapPin size={13} /> DELIVERY ADDRESS</p>
                      <p style={infoStyle}>{o.deliveryAddress}</p>
                      {o.landmark && <p style={{ ...infoStyle, color: '#78716c' }}>📍 Near: {o.landmark}</p>}
                      <p style={infoStyle}>
                        {[o.city, o.pincode].filter(Boolean).join(' - ')}
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <p style={sectionLabelStyle}>💳 PAYMENT</p>
                      <p style={infoStyle}>{o.paymentMethod?.replace('_', ' ')}</p>
                      <StatusBadge status={o.paymentStatus} map={PAYMENT_COLORS} />
                      {o.upiTransactionId && (
                        <p style={{ ...infoStyle, fontFamily: 'monospace', fontSize: 12, marginTop: 6, color: '#78716c' }}>
                          Txn: {o.upiTransactionId}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    {o.orderNotes && (
                      <div>
                        <p style={sectionLabelStyle}><FileText size={13} /> NOTES</p>
                        <p style={{ ...infoStyle, fontStyle: 'italic', color: '#78716c' }}>"{o.orderNotes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p style={sectionLabelStyle}><Package size={13} /> ITEMS ORDERED</p>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e7e5e4', overflow: 'hidden' }}>
                      {o.items?.map((item, idx) => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 16px', borderBottom: idx < o.items.length - 1 ? '1px solid #f5f5f4' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef3c7', overflow: 'hidden' }}>
                              {item.mango?.imageUrl
                                ? <img src={item.mango.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>🥭</div>
                              }
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 14 }}>{item.mango?.name}</p>
                              <p style={{ color: '#78716c', fontSize: 12 }}>
                                {item.quantity} {item.mango?.unit} × ₹{item.unitPrice}
                              </p>
                            </div>
                          </div>
                          <p style={{ fontWeight: 800, fontSize: 16, color: '#166534' }}>₹{item.totalPrice}</p>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#f9f9f8', fontWeight: 700, fontSize: 16 }}>
                        <span>Total</span>
                        <span style={{ color: '#166534' }}>₹{parseFloat(o.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, map }) {
  if (!status) return null
  const c = map[status] || { bg: '#f5f5f4', text: '#78716c' }
  return (
    <span style={{
      background: c.bg, color: c.text, padding: '4px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap'
    }}>{status}</span>
  )
}

const sectionLabelStyle = {
  fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: 1,
  textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5
}
const infoStyle = { fontSize: 14, color: '#1c1917', marginBottom: 3, lineHeight: 1.5 }