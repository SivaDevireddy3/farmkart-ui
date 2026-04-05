import { useState } from 'react'
import { authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function SellerChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [show, setShow] = useState({ cur: false, new: false, con: false })
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 8) return toast.error('New password must be at least 8 characters')
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await authAPI.sellerChangePass({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password changed successfully! 🔐')
      // Update local user state
      const updated = { ...user, passwordChanged: true }
      localStorage.setItem('authUser', JSON.stringify(updated))
      navigate('/seller/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const ToggleBtn = ({ field }) => (
    <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', display: 'flex' }}>
      {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#fffbf0' }}>
      <div className="card" style={{ padding: 'clamp(24px,5vw,40px)', width: '100%', maxWidth: 420 }}>
        <Link to="/seller/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#78716c', textDecoration: 'none', marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48 }}>🔐</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, marginTop: 10 }}>Change Password</h1>
          <p style={{ color: '#78716c', fontSize: 13, marginTop: 6 }}>Set a new secure password for your store account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Current Password', key: 'currentPassword', show: 'cur', placeholder: 'Your current password' },
            { label: 'New Password', key: 'newPassword', show: 'new', placeholder: 'At least 8 characters' },
            { label: 'Confirm New Password', key: 'confirm', show: 'con', placeholder: 'Re-enter new password' },
          ].map(({ label, key, show: s, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={show[s] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ paddingRight: 44 }}
                />
                <ToggleBtn field={s} />
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 14, fontSize: 15, marginTop: 4 }}>
            {loading ? 'Changing...' : 'Change Password 🔐'}
          </button>
        </form>
      </div>
    </div>
  )
}