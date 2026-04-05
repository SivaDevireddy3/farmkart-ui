import { useState, useEffect, useRef } from 'react'
import { mangoAPI, imageUrl as buildImgUrl } from '../../api'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'

const emptyForm = { name: '', category: '', description: '', price: '', stock: '', unit: 'kg', origin: '', weightPerUnit: '', isAvailable: true }

export default function AdminMangoes() {
  const [mangoes, setMangoes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const load = () => mangoAPI.getAll({ adminView: true }).then(r => setMangoes(r.data))
  useEffect(() => { load() }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)) }
  }

  const openEdit = (m) => {
    setForm({ name: m.name, category: m.category, description: m.description || '', price: m.price, stock: m.stock, unit: m.unit, origin: m.origin || '', weightPerUnit: m.weightPerUnit || '', isAvailable: m.isAvailable })
    setEditId(m.id); setPreview(buildImgUrl(m.imageUrl)); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)
      if (editId) { await mangoAPI.update(editId, fd); toast.success('Mango updated!') }
      else { await mangoAPI.create(fd); toast.success('Mango added! 🥭') }
      setShowForm(false); setForm(emptyForm); setEditId(null); setImage(null); setPreview(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving mango')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    await mangoAPI.delete(id); toast.success('Deleted!'); load()
  }

  const handleToggle = async (id) => { await mangoAPI.toggle(id); load() }

  return (
    <div className="page">
      <style>{`
        .mangoes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 12px; flex-wrap: wrap; }
        .mango-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mango-table-wrap { overflow-x: auto; }
        .mango-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px; }

        @media (max-width: 520px) {
          .mango-form-grid { grid-template-columns: 1fr; }
          .mangoes-header h1 { font-size: 22px; }
        }
      `}</style>

      <div className="mangoes-header">
        <div>
          <h1 className="section-title">Manage Mangoes 🥭</h1>
          <p className="section-sub">{mangoes.length} products in store</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); setPreview(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> Add Mango
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 'clamp(20px, 5vw, 32px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22 }}>{editId ? 'Edit Mango' : 'Add New Mango'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
              <div className="mango-form-grid">
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alphonso Mango" />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Premium, Local, etc." />
                </div>
                <div>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="250" />
                </div>
                <div>
                  <label style={labelStyle}>Stock *</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="50" />
                </div>
                <div>
                  <label style={labelStyle}>Unit *</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    {['kg', 'dozen', 'piece', 'box', 'tray'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Origin</label>
                  <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="Ratnagiri, Maharashtra" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe this mango..." />
              </div>
              <div>
                <label style={labelStyle}>Product Image</label>
                <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed #e7e5e4', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', background: '#fafaf9' }}>
                  {preview ? <img src={preview} alt="" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
                    : <div style={{ color: '#78716c' }}><div style={{ fontSize: 32 }}>📷</div><p style={{ fontSize: 13, marginTop: 8 }}>Click to upload image</p></div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} style={{ width: 'auto' }} />
                <label htmlFor="avail" style={{ fontSize: 14, fontWeight: 600 }}>Available for sale</label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: 14 }}>
                  {loading ? 'Saving...' : editId ? 'Update Mango' : 'Add Mango'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table — scrolls horizontally on mobile */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="mango-table-wrap">
          <table className="mango-table">
            <thead style={{ background: '#fafaf9' }}>
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 14px', textAlign: 'left', color: '#78716c', fontWeight: 600, borderBottom: '2px solid #e7e5e4', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mangoes.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', overflow: 'hidden' }}>
                      {buildImgUrl(m.imageUrl) ? <img src={buildImgUrl(m.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 22 }}>🥭</div>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{m.name}</td>
                  <td style={{ padding: '12px 14px' }}><span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>{m.category}</span></td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{m.price}/{m.unit}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ color: m.stock <= 5 ? '#dc2626' : m.stock <= 20 ? '#f59e0b' : '#166534', fontWeight: 600 }}>{m.stock}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${m.isAvailable ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {m.isAvailable ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(m)} style={{ background: 'none', border: '1px solid #e7e5e4', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#3b82f6' }}><Edit2 size={14} /></button>
                      <button onClick={() => handleToggle(m.id)} style={{ background: 'none', border: '1px solid #e7e5e4', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#f59e0b' }}>
                        {m.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button onClick={() => handleDelete(m.id, m.name)} style={{ background: 'none', border: '1px solid #e7e5e4', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mangoes.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#78716c' }}>No mangoes yet. Add your first one!</div>}
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }