import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function UserLogin() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ mobile: '', password: '', name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return toast.error('Enter a valid 10-digit mobile number')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      let res
      if (tab === 'login') {
        res = await authAPI.customerLogin({ mobile: form.mobile, password: form.password })
      } else {
        res = await authAPI.customerRegister({ ...form })
      }
      login(res.data, 'CUSTOMER')
      toast.success(tab === 'login' ? `Welcome back! 🥭` : `Account created! Welcome 🥭`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || (tab === 'login' ? 'Invalid mobile or password' : 'Registration failed'))
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #fef9ee, #fef3c7)', padding: 16
    }}>
      <div className="card" style={{ padding: 'clamp(24px,5vw,40px)', width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 52 }}>🥭</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, marginTop: 10, marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p style={{ color: '#78716c', fontSize: 13 }}>
            {tab === 'login' ? 'Login to track your orders & reorder easily' : 'Save orders, track deliveries, rate mangoes'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#f5f5f4', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {[['login', 'Login'], ['register', 'Register']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: 9,
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#1c1917' : '#78716c',
              boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}>{label}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {tab === 'register' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Full Name</label>
              <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Ravi Kumar" />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Mobile Number *
            </label>
            <input
              required
              value={form.mobile}
              maxLength={10}
              onChange={e => f('mobile', e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              inputMode="numeric"
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => f('password', e.target.value)}
                placeholder={tab === 'register' ? 'At least 6 characters' : '••••••••'}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', display: 'flex'
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Email <span style={{ color: '#a8a29e', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="ravi@email.com" />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 14, fontSize: 15, marginTop: 4 }}>
            {loading
              ? (tab === 'login' ? 'Logging in...' : 'Creating account...')
              : (tab === 'login' ? 'Login to Account' : 'Create Account')}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/" style={{ color: '#78716c', fontSize: 13, textDecoration: 'none' }}>
            ← Continue without login
          </Link>
          <p style={{ fontSize: 12, color: '#a8a29e' }}>
            <Link to="/seller/login" style={{ color: '#a8a29e' }}>Seller Login</Link>
            {' · '}
            <Link to="/admin/login" style={{ color: '#a8a29e' }}>Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}