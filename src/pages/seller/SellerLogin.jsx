import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function SellerLogin() {
  const [form, setForm] = useState({ mobile: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.sellerLogin(form)
      login(res.data, 'SELLER')
      toast.success(`Welcome, ${res.data.storeName}! 🥭`)
      if (!res.data.passwordChanged) {
        toast('Please change your default password for security', { icon: '⚠️', duration: 6000 })
      }
      navigate('/seller/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid mobile or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: 16
    }}>
      <div className="card" style={{ padding: 'clamp(24px, 5vw, 40px)', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56 }}>🏪</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, marginTop: 12 }}>Seller Login</h1>
          <p style={{ color: '#78716c', marginTop: 6 }}>Access your store dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Mobile Number (Login ID)
            </label>
            <input
              required
              value={form.mobile}
              maxLength={10}
              onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
              placeholder="9876543210"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', display: 'flex'
              }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 14, fontSize: 16, marginTop: 4 }}>
            {loading ? 'Logging in...' : 'Login to Store 🏪'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: '#78716c' }}>
            Your credentials are provided by the admin.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 13 }}>
            <Link to="/" style={{ color: '#78716c' }}>← Back to Shop</Link>
            <Link to="/admin/login" style={{ color: '#a8a29e' }}>Super Admin</Link>
          </div>
        </div>
      </div>
    </div>
  )
}