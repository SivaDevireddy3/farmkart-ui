import { useState } from 'react'
import { X } from 'lucide-react'
import { reviewAPI } from '../api'
import toast from 'react-hot-toast'

export default function RatingModal({ mango, onClose, reviewerName = '', reviewerPhone = '' }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState(reviewerName)
  const [phone, setPhone] = useState(reviewerPhone)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a star rating')
    setLoading(true)
    try {
      await reviewAPI.submit({ mangoId: mango.id, rating, comment, reviewerName: name, reviewerPhone: phone })
      toast.success('Thanks for your review! ⭐')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setLoading(false) }
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 300, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16
    }}>
      <div className="card" style={{ padding: 28, maxWidth: 400, width: '100%', borderRadius: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, margin: 0 }}>Rate this Mango</h3>
            <p style={{ color: '#78716c', fontSize: 13, margin: '4px 0 0' }}>{mango.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 42, lineHeight: 1, padding: 0,
                color: s <= (hover || rating) ? '#f59e0b' : '#e7e5e4',
                transition: 'color 0.1s, transform 0.1s',
                transform: s <= (hover || rating) ? 'scale(1.15)' : 'scale(1)'
              }}>★</button>
          ))}
        </div>

        {/* Rating label */}
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 18, minHeight: 20 }}>
          {hover || rating ? labels[hover || rating] : 'Tap a star to rate'}
        </p>

        {/* Name + phone if not prefilled */}
        {!reviewerName && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Your Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ravi Kumar" />
          </div>
        )}

        {/* Comment */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Comment (optional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this mango..."
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !rating}
          style={{ width: '100%', padding: 13, fontSize: 15 }}>
          {loading ? 'Submitting...' : `Submit ${rating ? labels[rating] + ' Rating' : 'Rating'} ⭐`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#a8a29e', marginTop: 10 }}>
          Your review will appear after approval
        </p>
      </div>
    </div>
  )
}