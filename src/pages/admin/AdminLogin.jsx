import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Try new endpoint first, fallback to legacy
      let res
      try {
        res = await authAPI.adminLogin(form)
      } catch {
        res = await authAPI.login(form)
      }
      // Store token for both legacy ProtectedRoute and new AuthContext
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('superAdminToken', res.data.token)
      login({ ...res.data, username: form.username }, 'SUPER_ADMIN')
      toast.success('Welcome back, Admin! 🛡️')
      navigate('/super-admin')
    } catch {
      toast.error('Invalid username or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: 16
    }}>
      <div className="card" style={{ padding: 'clamp(24px, 5vw, 40px)', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56 }}>🛡️</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, marginTop: 12 }}>Admin</h1>
          <p style={{ color: '#78716c', marginTop: 6 }}>MangoMart Management</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Username</label>
            <input
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', display: 'flex'
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 14, marginTop: 8, fontSize: 16 }}>
            {loading ? 'Logging in...' : 'Login to Admin 🔐'}
          </button>
        </form>

        {/* <div style={{ marginTop: 20, padding: '12px 14px', background: '#fafaf9', borderRadius: 10, fontSize: 12, color: '#78716c' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Default Credentials</p>
          <p>Username: <strong>admin</strong></p>
          <p>Password: <strong>admin@mango2024</strong></p>
        </div> */}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/seller/login" style={{ color: '#78716c', marginRight: 12 }}>Seller Login</Link>
          <Link to="/" style={{ color: '#78716c' }}>← Back to Shop</Link>
        </div>
      </div>
    </div>
  )
}