import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerAPI } from '../../api'
import toast from 'react-hot-toast'
import { Plus, ToggleLeft, ToggleRight, RefreshCw, Eye } from 'lucide-react'

export default function SuperAdminSellers() {
  const navigate = useNavigate()
  const [sellers, setSellers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(null)
  const [form, setForm] = useState({
    mobile: '', storeName: '', ownerName: '', email: '',
    whatsapp: '', city: '', storeDescription: ''
  })
  const [loading, setLoading] = useState(false)
  const [mobileError, setMobileError] = useState('')
  const [whatsappError, setWhatsappError] = useState('')

  const load = () => sellerAPI.getAll().then(r => setSellers(r.data))
  useEffect(() => { load() }, [])

  const validateMobile = (val) => {
    if (!val) return 'Mobile number is required'
    if (!/^[6-9]\d{9}$/.test(val)) return 'Enter a valid 10-digit Indian mobile number (starts with 6-9)'
    return ''
  }

  const validateWhatsapp = (val) => {
    if (val && !/^[6-9]\d{9}$/.test(val)) return 'Enter a valid 10-digit WhatsApp number'
    return ''
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const mobErr = validateMobile(form.mobile)
    const waErr = validateWhatsapp(form.whatsapp)
    setMobileError(mobErr)
    setWhatsappError(waErr)
    if (mobErr || waErr) return

    setLoading(true)
    try {
      const res = await sellerAPI.create(form)
      toast.success('Seller created! 🏪')
      setShowPasswordModal({
        storeName: form.storeName,
        mobile: form.mobile,
        password: res.data.defaultPassword
      })
      setShowForm(false)
      setForm({ mobile: '', storeName: '', ownerName: '', email: '', whatsapp: '', city: '', storeDescription: '' })
      setMobileError('')
      setWhatsappError('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating seller')
    } finally { setLoading(false) }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Manage Sellers 🏪</h1>
          <p style={{ color: '#78716c' }}>{sellers.length} sellers registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Seller
        </button>
      </div>

      {/* Seller cards */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {sellers.map(s => (
          <div key={s.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>{s.storeName}</h3>
                <p style={{ color: '#78716c', fontSize: 13 }}>{s.ownerName} · {s.city}</p>
              </div>
              <span style={{
                background: s.isActive ? '#dcfce7' : '#fee2e2',
                color: s.isActive ? '#166534' : '#dc2626',
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
              }}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ fontSize: 13, color: '#78716c', marginBottom: 12 }}>
              <p>📱 {s.mobile}</p>
              {s.email && <p>✉️ {s.email}</p>}
              <p style={{ marginTop: 4, fontSize: 11 }}>
                Password: {s.passwordChanged ? '✅ Changed' : '⚠️ Still default'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => sellerAPI.toggle(s.id).then(load)}
                className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>
                {s.isActive ? <><ToggleRight size={14} /> Deactivate</> : <><ToggleLeft size={14} /> Activate</>}
              </button>
              <button onClick={() => sellerAPI.resetPassword(s.id).then(r => {
                toast.success('Password reset')
                setShowPasswordModal({ storeName: s.storeName, mobile: s.mobile, password: r.data.defaultPassword })
              })} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>
                🔑 Reset Pass
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => navigate(`/seller-view/${s.id}`)}
              >
                <Eye size={14} /> View Dashboard
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Seller Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 560, maxHeight: '90vh',
            overflow: 'auto', padding: 32
          }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 20 }}>Add New Seller</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Mobile * (login ID)</label>
                  <input required value={form.mobile} maxLength={10}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      setForm({ ...form, mobile: val })
                      setMobileError(validateMobile(val))
                    }}
                    onBlur={() => setMobileError(validateMobile(form.mobile))}
                    placeholder="Enter Mobile Number"
                    style={{ borderColor: mobileError ? '#dc2626' : undefined }}
                  />
                  {mobileError && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 4, fontFamily: 'DM Sans' }}>{mobileError}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Store Name *</label>
                  <input required value={form.storeName}
                    onChange={e => setForm({ ...form, storeName: e.target.value })} placeholder="Enter Store Name" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Owner Name</label>
                  <input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Enter Name" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>City</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Vijayawada" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter Email" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>WhatsApp</label>
                  <input value={form.whatsapp} maxLength={10}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      setForm({ ...form, whatsapp: val })
                      setWhatsappError(validateWhatsapp(val))
                    }}
                    onBlur={() => setWhatsappError(validateWhatsapp(form.whatsapp))}
                    placeholder="10-digit WhatsApp number"
                    style={{ borderColor: whatsappError ? '#dc2626' : undefined }}
                  />
                  {whatsappError && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 4, fontFamily: 'DM Sans' }}>{whatsappError}</p>}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Store Description</label>
                <textarea rows={3} value={form.storeDescription}
                  onChange={e => setForm({ ...form, storeDescription: e.target.value })}
                  placeholder="Fresh mangoes from the farm..." />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password reveal modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>Seller Credentials</h3>
            <p style={{ color: '#78716c', marginBottom: 20, fontSize: 14 }}>
              Share these credentials with the seller. The password won't be shown again.
            </p>
            <div style={{ background: '#fef3c7', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{showPasswordModal.storeName}</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>📱 Mobile: <strong>{showPasswordModal.mobile}</strong></p>
              <p style={{ fontSize: 14, marginTop: 4 }}>🔒 Password: <strong>{showPasswordModal.password}</strong></p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowPasswordModal(null)}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  )
}