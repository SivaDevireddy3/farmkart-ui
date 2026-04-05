import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../api'
import toast from 'react-hot-toast'
import { CreditCard, MapPin, User, Phone, Mail, FileText, ArrowLeft, ShoppingBag, IndianRupee, Banknote } from 'lucide-react'

export default function Checkout({ cart, clearCart }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    deliveryAddress: '', city: '', pincode: '', landmark: '', orderNotes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.customerName.trim()) e.customerName = 'Full name is required'
    if (!form.customerPhone.trim()) e.customerPhone = 'Mobile number is required'
    else if (!/^[6-9]\d{9}$/.test(form.customerPhone.replace(/\s/g, '')))
      e.customerPhone = 'Enter a valid 10-digit Indian mobile number'
    if (form.customerEmail && form.customerEmail.trim()) {
      if (!/\S+@\S+\.\S+/.test(form.customerEmail)) {
        e.customerEmail = 'Enter a valid email';
      }
    }
    if (!form.deliveryAddress.trim()) e.deliveryAddress = 'Delivery address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.pincode.trim()) e.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (cart.length === 0) return toast.error('Cart is empty!')

    setLoading(true)

    try {
      const payload = {
        ...form,
        paymentMethod,
        items: cart.map(i => ({ mangoId: i.id, quantity: i.qty }))
      }

      const res = await orderAPI.place(payload)

      clearCart()

      if (paymentMethod === 'COD') {
        toast.success('✅ Order Placed Successfully (Cash on Delivery)')
        navigate(`/track?order=${res.data.orderNumber}`)
      } else {
        navigate(`/payment/${res.data.orderNumber}`, { state: res.data })
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 80 }}>🛒</div>
      <h2 style={{ marginTop: 16, marginBottom: 8 }}>Your cart is empty</h2>
      <Link to="/"><button className="btn btn-primary">Browse Mangoes</button></Link>
    </div>
  )

  return (
    <div className="page">
      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }
        .checkout-summary {
          position: sticky;
          top: 80px;
        }
        .form-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          /* Put summary on top on mobile */
          .checkout-summary {
            position: static;
            order: -1;
          }
          .checkout-forms { order: 1; }
        }

        @media (max-width: 520px) {
          .form-2col {
            grid-template-columns: 1fr;
          }
          .payment-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }

        @media (max-width: 380px) {
          .payment-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Link to="/cart" style={{ textDecoration: 'none', color: '#78716c', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to cart
        </Link>
      </div>
      <h1 className="section-title">Checkout 📦</h1>
      <p className="section-sub">Fill in your delivery details</p>

      <form onSubmit={handleSubmit}>
        <div className="checkout-layout">
          {/* LEFT — forms */}
          <div className="checkout-forms" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#fef3c7', padding: 8, borderRadius: 10 }}><User size={18} style={{ color: '#f59e0b' }} /></div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>Contact Details</h3>
              </div>
              <div className="form-2col">
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input value={form.customerName} onChange={e => set('customerName', e.target.value)}
                    placeholder="Siva Devireddy" style={errors.customerName ? errorInputStyle : {}} />
                  {errors.customerName && <p style={errorStyle}>{errors.customerName}</p>}
                </div>
                <div>
                  <label style={labelStyle}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} /> Mobile *</span></label>
                  <input value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)}
                    placeholder="9876543210" maxLength={10} style={errors.customerPhone ? errorInputStyle : {}} />
                  {errors.customerPhone && <p style={errorStyle}>{errors.customerPhone}</p>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={13} /> Email (Optional)</span></label>
                  <input type="email" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)}
                    placeholder="siva@email.com" style={errors.customerEmail ? errorInputStyle : {}} />
                  {errors.customerEmail && <p style={errorStyle}>{errors.customerEmail}</p>}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#dcfce7', padding: 8, borderRadius: 10 }}><MapPin size={18} style={{ color: '#166534' }} /></div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>Delivery Address</h3>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Street Address / House No. *</label>
                  <textarea value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)}
                    placeholder="House No. 42, Main Road..." rows={2}
                    style={errors.deliveryAddress ? { ...errorInputStyle, resize: 'vertical' } : { resize: 'vertical' }} />
                  {errors.deliveryAddress && <p style={errorStyle}>{errors.deliveryAddress}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Landmark (Optional)</label>
                  <input value={form.landmark} onChange={e => set('landmark', e.target.value)}
                    placeholder="Near SBI Bank, Opposite Temple..." />
                </div>
                <div className="form-2col">
                  <div>
                    <label style={labelStyle}>City / Town *</label>
                    <input value={form.city} onChange={e => set('city', e.target.value)}
                      placeholder="Vijayawada" style={errors.city ? errorInputStyle : {}} />
                    {errors.city && <p style={errorStyle}>{errors.city}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Pincode *</label>
                    <input value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                      placeholder="520001" maxLength={6} style={errors.pincode ? errorInputStyle : {}} />
                    {errors.pincode && <p style={errorStyle}>{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#ede9fe', padding: 8, borderRadius: 10 }}><FileText size={18} style={{ color: '#7c3aed' }} /></div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>Order Notes</h3>
              </div>
              <textarea value={form.orderNotes} onChange={e => set('orderNotes', e.target.value)}
                placeholder="Any special instructions? e.g. Call before delivery, preferred timing, etc."
                rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 16 }}>Payment Method</h3>
              <div className="payment-grid">
                {[
                  { value: 'RAZORPAY', label: 'Pay Online', icon: CreditCard, desc: 'Cards, UPI, Net Banking & more' },
                  { value: 'COD', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when order arrives' }
                ].map(m => (
                  <div key={m.value} onClick={() => setPaymentMethod(m.value)} style={{
                    padding: 16, borderRadius: 14,
                    border: `2px solid ${paymentMethod === m.value ? '#f59e0b' : '#e7e5e4'}`,
                    background: paymentMethod === m.value ? '#fef3c7' : 'white',
                    cursor: 'pointer',
                  }}>
                    <m.icon size={24} style={{ color: '#f59e0b', marginBottom: 8 }} />
                    <p style={{ fontWeight: 700, marginBottom: 2, fontSize: 14 }}>{m.label}</p>
                    <p style={{ fontSize: 12, color: '#78716c' }}>{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — summary */}
          <div className="card checkout-summary" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <ShoppingBag size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>Order Summary</h3>
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef3c7', overflow: 'hidden', flexShrink: 0 }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL}${item.imageUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>🥭</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ color: '#78716c', fontSize: 12 }}>× {item.qty} {item.unit}</p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, flexShrink: 0 }}>₹{(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e7e5e4', marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: '#78716c' }}>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14 }}>
              <span style={{ color: '#78716c' }}>Delivery</span>
              <span style={{ color: '#166534', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 700, fontSize: 20 }}>
              <span>Total</span>
              <span style={{ color: '#166534' }}>₹{total.toFixed(2)}</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700 }}>
              {loading ? '⏳ Placing Order...' : '🥭 Place Order'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#78716c', marginTop: 12 }}>🔒 Your details are safe and secure</p>
          </div>
        </div>
      </form>
    </div>
  )
}

const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: '#44403c' }
const errorStyle = { color: '#dc2626', fontSize: 12, marginTop: 4 }
const errorInputStyle = { borderColor: '#dc2626', background: '#fff5f5' }