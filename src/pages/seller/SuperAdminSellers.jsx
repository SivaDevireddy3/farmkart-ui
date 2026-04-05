import { useState, useEffect } from 'react'
import { sellerAPI } from '../../api'
import toast from 'react-hot-toast'
import { Plus, ToggleLeft, ToggleRight, RefreshCw, ArrowLeft, X, Key } from 'lucide-react'
import { Link } from 'react-router-dom'

const EMPTY_FORM = {
  mobile: '', storeName: '', ownerName: '',
  email: '', whatsapp: '', city: '', storeDescription: ''
}

export default function SuperAdminSellers() {
  const [sellers, setSellers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editSeller, setEditSeller] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [pageLoad, setPageLoad] = useState(true)
  const [credModal, setCredModal] = useState(null) // { storeName, mobile, password }

  const load = async () => {
    try {
      const res = await sellerAPI.getAll()
      setSellers(res.data)
    } catch { toast.error('Failed to load sellers') }
    finally { setPageLoad(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditSeller(null)
    setShowForm(true)
  }

  const openEdit = (s) => {
    setForm({
      mobile: s.mobile, storeName: s.storeName, ownerName: s.ownerName || '',
      email: s.email || '', whatsapp: s.whatsapp || '', city: s.city || '',
      storeDescription: s.storeDescription || ''
    })
    setEditSeller(s)
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setForm(EMPTY_FORM); setEditSeller(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editSeller && (!form.mobile || form.mobile.length !== 10)) {
      return toast.error('Enter a valid 10-digit mobile number')
    }
    if (!form.storeName.trim()) return toast.error('Store name is required')

    setLoading(true)
    try {
      if (editSeller) {
        await sellerAPI.update(editSeller.id, form)
        toast.success('Seller updated!')
        closeForm()
        load()
      } else {
        const res = await sellerAPI.create(form)
        closeForm()
        setCredModal({
          storeName: form.storeName,
          mobile: form.mobile,
          password: res.data.defaultPassword || 'Mango@1234'
        })
        load()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save seller')
    } finally { setLoading(false) }
  }

  const handleToggle = async (seller) => {
    try {
      await sellerAPI.toggle(seller.id)
      toast.success(seller.isActive ? 'Seller deactivated' : 'Seller activated')
      load()
    } catch { toast.error('Failed to update') }
  }

  const handleResetPassword = async (seller) => {
    if (!window.confirm(`Reset password for ${seller.storeName}?`)) return
    try {
      const res = await sellerAPI.resetPassword(seller.id)
      setCredModal({
        storeName: seller.storeName,
        mobile: seller.mobile,
        password: res.data.defaultPassword || 'Mango@1234'
      })
      load()
    } catch { toast.error('Failed to reset password') }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const L = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#44403c' }

  return (
    <div className="page">
      <style>{`
        .seller-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; }
        .seller-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:520px){
          .seller-form-grid { grid-template-columns:1fr; }
          .seller-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Link to="/super-admin" style={{ color: '#78716c', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Dashboard
            </Link>
          </div>
          <h1 className="section-title">Manage Sellers 🏪</h1>
          <p className="section-sub">{sellers.length} seller{sellers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={15} className={pageLoad ? 'spin' : ''} />
          </button>
          <button onClick={openAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Add Seller
          </button>
        </div>
      </div>

      {/* Seller cards */}
      {pageLoad ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#78716c' }}>Loading sellers...</div>
      ) : sellers.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>No Sellers Yet</h3>
          <p style={{ color: '#78716c', marginBottom: 24 }}>Add your first mango seller!</p>
          <button className="btn btn-primary" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Add First Seller
          </button>
        </div>
      ) : (
        <div className="seller-grid">
          {sellers.map(s => (
            <div key={s.id} className="card" style={{ padding: 20 }}>
              {/* Store header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
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
                  {s.isActive ? '● Active' : '○ Inactive'}
                </span>
              </div>

              {/* Info */}
              <div style={{ fontSize: 13, color: '#57534e', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>📱</span>
                  <span style={{ fontWeight: 600 }}>{s.mobile}</span>
                </div>
                {s.city && <div><span>📍 {s.city}</span></div>}
                {s.email && <div><span>✉️ {s.email}</span></div>}
                {s.whatsapp && <div><span>💬 {s.whatsapp}</span></div>}
                {s.storeDescription && (
                  <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.storeDescription}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12 }}>
                  <span>🔐</span>
                  {s.passwordChanged
                    ? <span style={{ color: '#166534', fontWeight: 600 }}>Password changed</span>
                    : <span style={{ color: '#f59e0b', fontWeight: 600 }}>Using default password</span>
                  }
                </div>
                <div style={{ fontSize: 11, color: '#a8a29e' }}>
                  Added {new Date(s.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => openEdit(s)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '7px 0', fontSize: 12 }}>
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggle(s)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '7px 0', fontSize: 12, color: s.isActive ? '#dc2626' : '#166534', borderColor: s.isActive ? '#dc2626' : '#166534' }}>
                  {s.isActive ? <><ToggleRight size={13} /> Disable</> : <><ToggleLeft size={13} /> Enable</>}
                </button>
                <button
                  onClick={() => handleResetPassword(s)}
                  style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '7px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Key size={12} /> Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto', padding: 'clamp(20px,5vw,32px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, margin: 0 }}>
                {editSeller ? 'Edit Seller' : 'Add New Seller'}
              </h3>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="seller-form-grid">
                <div>
                  <label style={L}>Mobile Number * {!editSeller && <span style={{ color: '#a8a29e' }}>(Login ID)</span>}</label>
                  <input
                    required
                    value={form.mobile}
                    maxLength={10}
                    disabled={!!editSeller}
                    onChange={e => f('mobile', e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    style={editSeller ? { background: '#f5f5f4', color: '#a8a29e' } : {}}
                  />
                  {editSeller && <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 4 }}>Mobile cannot be changed</p>}
                </div>
                <div>
                  <label style={L}>Store Name *</label>
                  <input required value={form.storeName} onChange={e => f('storeName', e.target.value)} placeholder="Ravi Mango Store" />
                </div>
                <div>
                  <label style={L}>Owner Name</label>
                  <input value={form.ownerName} onChange={e => f('ownerName', e.target.value)} placeholder="Ravi Kumar" />
                </div>
                <div>
                  <label style={L}>City</label>
                  <input value={form.city} onChange={e => f('city', e.target.value)} placeholder="Vijayawada" />
                </div>
                <div>
                  <label style={L}>Email</label>
                  <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="ravi@store.com" />
                </div>
                <div>
                  <label style={L}>WhatsApp</label>
                  <input value={form.whatsapp} onChange={e => f('whatsapp', e.target.value.replace(/\D/g, ''))} placeholder="9876543210" maxLength={10} />
                </div>
              </div>

              <div>
                <label style={L}>Store Description</label>
                <textarea rows={3} value={form.storeDescription} onChange={e => f('storeDescription', e.target.value)} placeholder="Fresh mangoes directly from our farm..." style={{ resize: 'vertical' }} />
              </div>

              {!editSeller && (
                <div style={{ background: '#fef3c7', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e' }}>
                  <strong>ℹ️ Default password will be generated automatically.</strong> You'll see it after saving to share with the seller.
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, padding: 14, fontSize: 15 }}>
                  {loading ? 'Saving...' : editSeller ? '✅ Update Seller' : '🏪 Create Seller Account'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeForm} style={{ flex: 1, padding: 14 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials modal — shown once after create or reset */}
      {credModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ padding: 32, maxWidth: 420, width: '100%', textAlign: 'center', borderRadius: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔑</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>Seller Credentials</h3>
            <p style={{ color: '#78716c', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Share these credentials with the seller. <strong>The password won't be shown again.</strong>
            </p>

            <div style={{ background: '#fef3c7', borderRadius: 14, padding: 20, marginBottom: 22, textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12, fontFamily: 'Playfair Display' }}>
                🏪 {credModal.storeName}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#78716c' }}>Login URL</span>
                  <span style={{ fontWeight: 600 }}>/seller/login</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#78716c' }}>Mobile</span>
                  <span style={{ fontWeight: 700 }}>{credModal.mobile}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#78716c' }}>Password</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', background: 'white', padding: '2px 8px', borderRadius: 6 }}>{credModal.password}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(`Login: /seller/login\nMobile: ${credModal.mobile}\nPassword: ${credModal.password}`)
                  .then(() => toast.success('Copied to clipboard!'))
                  .catch(() => { })
              }}
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: 10 }}>
              📋 Copy Credentials
            </button>
            <button className="btn btn-primary" onClick={() => setCredModal(null)} style={{ width: '100%' }}>
              Got it, I've saved this ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}