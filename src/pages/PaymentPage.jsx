import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paymentAPI } from '../api'
import toast from 'react-hot-toast'
import { CheckCircle, ShieldCheck, Loader2 } from 'lucide-react'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentPage() {
  const { orderNumber } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const orderData = location.state || {}

  const [status, setStatus] = useState('idle')   // idle | loading | success | failed
  const [paymentId, setPaymentId] = useState('')

  useEffect(() => {
    handlePay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePay = async () => {
    setStatus('loading')

    // 1. Load the Razorpay JS SDK
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      toast.error('Failed to load payment SDK. Check your internet connection.')
      setStatus('idle')
      return
    }

    // 2. Ask our backend to create a Razorpay order
    let rzpData
    try {
      const res = await paymentAPI.createOrder(orderNumber)
      rzpData = res.data
    } catch (err) {
      toast.error('Could not initiate payment. Please try again.')
      setStatus('idle')
      return
    }

    // 3. Configure the Razorpay checkout modal
    const options = {
      key: rzpData.keyId,
      amount: rzpData.amount,
      currency: rzpData.currency,
      name: 'MangoMart 🥭',
      description: `Order #${orderNumber}`,
      image: '/logo.png',
      order_id: rzpData.razorpayOrderId,

      prefill: {
        name: rzpData.customerName,
        email: rzpData.customerEmail,
        contact: rzpData.customerPhone,
      },

      config: {
        display: {
          blocks: {
            utib: { name: 'Pay using UPI', instruments: [{ method: 'upi' }] },
          },
          sequence: ['block.utib'],
          preferences: { show_default_blocks: true },
        },
      },

      theme: { color: '#166534' },

      handler: async (response) => {
        try {
          const verifyRes = await paymentAPI.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderNumber,
          })
          setPaymentId(response.razorpay_payment_id)
          setStatus('success')
          toast.success('Payment confirmed! 🎉')
        } catch (err) {
          const msg = err.response?.data?.message || err.message
          toast.error('Payment verification failed: ' + msg)
          setStatus('failed')
        }
      },

      modal: {
        ondismiss: () => {
          toast('Payment cancelled. You can retry anytime.')
          setStatus('idle')
        },
      },
    }

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`)
      setStatus('failed')
    })

    rzp.open()
  }

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="page" style={{ maxWidth: 500, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 80 }}>🎉</div>
        <CheckCircle size={60} style={{ color: '#166534', margin: '16px auto', display: 'block' }} />
        <h2 style={{ marginBottom: 8 }}>Payment Confirmed!</h2>
        <p style={{ color: '#78716c', marginBottom: 6 }}>
          Your order <strong>{orderNumber}</strong> is confirmed.
        </p>
        <p style={{ color: '#78716c', marginBottom: 6, fontSize: 13 }}>
          Payment ID: <code style={{ background: '#f5f5f4', padding: '2px 6px', borderRadius: 4 }}>{paymentId}</code>
        </p>
        <p style={{ color: '#78716c', marginBottom: 24 }}>
          We'll deliver your fresh mangoes soon! 🥭
        </p>
        <a href="/"><button className="btn btn-primary">Continue Shopping</button></a>
      </div>
    )
  }

  // ─── Loading screen ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="page" style={{ maxWidth: 500, textAlign: 'center', paddingTop: 100 }}>
        <Loader2 size={48} style={{ color: '#166534', animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
        <h3>Opening payment…</h3>
        <p style={{ color: '#78716c', fontSize: 14 }}>You'll be redirected to your UPI app in a moment.</p>
      </div>
    )
  }

  // ─── Idle / retry screen ─────────────────────────────────────────────────────
  return (
    <div className="page" style={{ maxWidth: 500 }}>
      <h1 className="section-title">Complete Payment</h1>
      <p className="section-sub">
        Order #{orderNumber} · Total:{' '}
        <strong style={{ color: '#166534' }}>₹{orderData.totalAmount}</strong>
      </p>

      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📲</div>

        <h3 style={{ marginBottom: 8, fontFamily: 'Playfair Display' }}>Pay with UPI</h3>
        <p style={{ color: '#78716c', marginBottom: 24, fontSize: 14 }}>
          PhonePe · Google Pay · Paytm · BHIM and all UPI apps supported
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          {['PhonePe', 'GPay', 'Paytm', 'BHIM'].map((app) => (
            <div key={app} style={{
              background: '#f5f5f4', borderRadius: 10, padding: '8px 14px',
              fontSize: 13, fontWeight: 600, color: '#44403c'
            }}>
              {app}
            </div>
          ))}
        </div>

        <button
          className="btn btn-green"
          onClick={handlePay}
          disabled={status === 'loading'}
          style={{ width: '100%', padding: 14, fontSize: 15, marginBottom: 16 }}
        >
          {status === 'loading' ? 'Opening…' : `Pay ₹${orderData.totalAmount}`}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#78716c', fontSize: 12 }}>
          <ShieldCheck size={14} style={{ color: '#166534' }} />
          <span>Secured by Razorpay · 256-bit SSL encryption</span>
        </div>
      </div>

      {status === 'failed' && (
        <div style={{
          marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, padding: 16, textAlign: 'center'
        }}>
          <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 4 }}>Payment failed</p>
          <p style={{ color: '#78716c', fontSize: 14 }}>Please try again or use a different UPI app.</p>
        </div>
      )}
    </div>
  )
}