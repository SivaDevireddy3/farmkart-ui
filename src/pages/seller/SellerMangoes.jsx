import { useState, useEffect, useRef } from 'react'
import { mangoAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const EMPTY = {
  name: '', category: '', description: '', price: '',
  stock: '', unit: 'kg', origin: '', weightPerUnit: '', isAvailable: true,
}

export default function SellerMangoes() {
  const { user } = useAuth()
  const [mangoes, setMangoes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoad, setPageLoad] = useState(true)
  const fileRef = useRef()

  const load = async () => {
    try {
      // FIX Bug 11/13: pass sellerId so the backend only returns THIS seller's mangoes.
      // Falls back to unfiltered adminView if sellerId is somehow missing (shouldn't happen).
      const sellerId = user?.sellerId
      const params = sellerId
        ? { adminView: true, sellerId }
        : { adminView: true }
      const res = await mangoAPI.getAll(params)
      setMangoes(res.data)
    } catch (err) {
      toast.error('Failed to load mangoes')
    } finally {
      setPageLoad(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const openEdit = (m) => {
    setForm({
      name: m.name, category: m.category, description: m.description || '',
      price: m.price, stock: m.stock, unit: m.unit,
      origin: m.origin || '', weightPerUnit: m.weightPerUnit || '', isAvailable: m.isAvailable,
    })
    setEditId(m.id)
    setPreview(m.imageUrl
      ? (m.imageUrl.startsWith('http') ? m.imageUrl : `${import.meta.env.VITE_API_URL}${m.imageUrl}`)
      : null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false); setForm(EMPTY); setEditId(null)
    setImage(null); setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.price || Number(form.price) <= 0) return toast.error('Valid price is required')
    if (form.stock === '' || Number(form.stock) < 0) return toast.error('Valid stock is required')

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (image) fd.append('image', image)

      if (editId) {
        await mangoAPI.update(editId, fd)
        toast.success('Mango updated! ✅')
      } else {
        await mangoAPI.create(fd)
        toast.success('Mango added! 🥭')
      }
      closeForm()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save mango')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await mangoAPI.delete(id)
      toast.success('Deleted!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleToggle = async (id) => {
    try { await mangoAPI.toggle(id); load() }
    catch { toast.error('Failed to toggle') }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const L = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#44403c' }

  if (pageLoad) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48 }}>🥭</div>
      <p style={{ color: '#78716c', marginTop: 12 }}>Loading your mangoes…</p>
    </div>
  )

  return (
    <div className="page">
      <style>{`
        .sm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; gap:12px; flex-wrap:wrap; }
        .sm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .sm-table-wrap { overflow-x:auto; }
        .sm-table { width:100%; border-collapse:collapse; font-size:13px; min-width:580px; }
        .sm-table th { padding:12px 14px; text-align:left; color:#78716c; border-bottom:2px solid #e7e5e4; white-space:nowrap; font-weight:600; }
        .sm-table td { padding:11px 14px; border-bottom:1px solid #f5f5f4; vertical-align:middle; }
        @media(max-width:520px){ .sm-form-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* Header */}
      <div className="sm-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Link to="/seller/dashboard"
              style={{ color: '#78716c', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Dashboard
            </Link>
          </div>
          <h1 className="section-title">My Mangoes 🥭</h1>
          <p className="section-sub">
            {mangoes.length} product{mangoes.length !== 1 ? 's' : ''} in {user?.storeName || 'your store'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { closeForm(); setShowForm(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={17} /> Add Mango
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 600, maxHeight: '92vh',
            overflowY: 'auto', padding: 'clamp(20px,5vw,32px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, margin: 0 }}>
                {editId ? 'Edit Mango' : 'Add New Mango'}
              </h3>
              <button onClick={closeForm}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="sm-form-grid">
                <div>
                  <label style={L}>Mango Name *</label>
                  <input required value={form.name}
                    onChange={e => f('name', e.target.value)} placeholder="Alphonso Mango" />
                </div>
                <div>
                  <label style={L}>Category *</label>
                  <input required value={form.category}
                    onChange={e => f('category', e.target.value)} placeholder="Premium, Local, Seasonal…" />
                </div>
                <div>
                  <label style={L}>Price (₹) *</label>
                  <input required type="number" step="0.01" min="1" value={form.price}
                    onChange={e => f('price', e.target.value)} placeholder="250" />
                </div>
                <div>
                  <label style={L}>Stock *</label>
                  <input required type="number" min="0" value={form.stock}
                    onChange={e => f('stock', e.target.value)} placeholder="50" />
                </div>
                <div>
                  <label style={L}>Unit *</label>
                  <select value={form.unit} onChange={e => f('unit', e.target.value)}>
                    {['kg', 'dozen', 'piece', 'box', 'tray'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={L}>Origin</label>
                  <input value={form.origin} onChange={e => f('origin', e.target.value)}
                    placeholder="Ratnagiri, Maharashtra" />
                </div>
              </div>

              <div>
                <label style={L}>Description</label>
                <textarea value={form.description} onChange={e => f('description', e.target.value)}
                  rows={3} placeholder="Describe the taste, aroma, and quality…"
                  style={{ resize: 'vertical' }} />
              </div>

              {/* Image upload */}
              <div>
                <label style={L}>Product Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed #e7e5e4', borderRadius: 12, padding: 20,
                    textAlign: 'center', cursor: 'pointer', background: '#fafaf9', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e7e5e4'}>
                  {preview ? (
                    <div>
                      <img src={preview} alt="" style={{ maxHeight: 130, borderRadius: 10, objectFit: 'cover', maxWidth: '100%' }} />
                      <p style={{ fontSize: 12, color: '#78716c', marginTop: 8 }}>Click to change image</p>
                    </div>
                  ) : (
                    <div style={{ color: '#78716c' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>Click to upload image</p>
                      <p style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP · Max 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Available checkbox */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: '#fafaf9', borderRadius: 10
              }}>
                <input type="checkbox" id="avail" checked={form.isAvailable}
                  onChange={e => f('isAvailable', e.target.checked)}
                  style={{ width: 'auto', accentColor: '#f59e0b' }} />
                <label htmlFor="avail"
                  style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  Available for sale (visible to customers)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}
                  style={{ flex: 2, padding: 14, fontSize: 15 }}>
                  {loading ? 'Saving…' : editId ? '✅ Update Mango' : '🥭 Add Mango'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeForm}
                  style={{ flex: 1, padding: 14 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {mangoes.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🥭</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>No Mangoes Yet</h3>
          <p style={{ color: '#78716c', marginBottom: 24 }}>Add your first mango to start selling!</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Plus size={17} /> Add First Mango
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="sm-table-wrap">
            <table className="sm-table">
              <thead style={{ background: '#fafaf9' }}>
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mangoes.map(m => {
                  const imgSrc = m.imageUrl
                    ? (m.imageUrl.startsWith('http') ? m.imageUrl : `${import.meta.env.VITE_API_URL}${m.imageUrl}`)
                    : null
                  return (
                    <tr key={m.id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td>
                        <div style={{ width: 46, height: 46, borderRadius: 10, background: '#fef3c7', overflow: 'hidden' }}>
                          {imgSrc
                            ? <img src={imgSrc} alt={m.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none' }} />
                            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 24 }}>🥭</div>
                          }
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>
                        <span style={{
                          background: '#fef3c7', color: '#92400e',
                          padding: '3px 9px', borderRadius: 20, fontSize: 12, fontWeight: 600
                        }}>
                          {m.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{m.price}<span style={{ color: '#a8a29e', fontWeight: 400 }}>/{m.unit}</span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: m.stock === 0 ? '#dc2626' : m.stock <= 5 ? '#f59e0b' : '#166534'
                        }}>
                          {m.stock}
                        </span>
                        {m.stock === 0 && (
                          <span style={{ fontSize: 10, color: '#dc2626', marginLeft: 4 }}>OOS</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: m.isAvailable ? '#dcfce7' : '#f5f5f4',
                          color: m.isAvailable ? '#166534' : '#78716c',
                        }}>
                          {m.isAvailable ? '● Active' : '○ Hidden'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(m)} title="Edit"
                            style={{
                              background: 'none', border: '1px solid #e7e5e4', borderRadius: 8,
                              padding: '6px 9px', cursor: 'pointer', color: '#3b82f6'
                            }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleToggle(m.id)}
                            title={m.isAvailable ? 'Hide' : 'Show'}
                            style={{
                              background: 'none', border: '1px solid #e7e5e4', borderRadius: 8,
                              padding: '6px 9px', cursor: 'pointer', color: '#f59e0b'
                            }}>
                            {m.isAvailable ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          </button>
                          <button onClick={() => handleDelete(m.id, m.name)} title="Delete"
                            style={{
                              background: 'none', border: '1px solid #e7e5e4', borderRadius: 8,
                              padding: '6px 9px', cursor: 'pointer', color: '#dc2626'
                            }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}