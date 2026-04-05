import { useNavigate, Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'

export default function Cart({ cart, updateCart }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const navigate = useNavigate()

  if (cart.length === 0) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 80 }}>🛒</div>
      <h2 style={{ marginTop: 16, marginBottom: 8 }}>Your cart is empty</h2>
      <p style={{ color: '#78716c', marginBottom: 24 }}>Add some delicious mangoes!</p>
      <Link to="/"><button className="btn btn-primary">Browse Mangoes</button></Link>
    </div>
  )

  return (
    <div className="page">
      {/* Replace your cart layout div */}
      <style>{`
  .cart-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 20px;
    align-items: start;
  }
  .cart-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
  }
  .cart-item-img { width: 64px; height: 64px; flex-shrink: 0; }
  .cart-item-name { font-weight: 700; font-size: 15px; margin: 0 0 2px; }
  .cart-item-price { min-width: 70px; text-align: right; }
  .qty-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  @media (max-width: 768px) {
    .cart-layout { grid-template-columns: 1fr; }
    .cart-summary { order: 2; }
  }

  @media (max-width: 480px) {
    .cart-item { flex-wrap: wrap; gap: 10px; }
    .cart-item-img { width: 52px; height: 52px; }
    .cart-item-name { font-size: 14px; }
    .cart-item-price { min-width: unset; }
    /* Push qty + price + delete to their own row */
    .cart-item-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      justify-content: space-between;
      padding-top: 4px;
      border-top: 1px solid #f5f5f4;
    }
  }
`}</style>

      <div className="cart-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.map(item => (
            <div key={item.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div className="cart-item">
                <div className="cart-item-img" style={{ background: '#fef3c7', borderRadius: 12, overflow: 'hidden' }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL}${item.imageUrl}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 28 }}>🥭</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p style={{ color: '#78716c', fontSize: 13, margin: 0 }}>₹{item.price}/{item.unit}</p>
                </div>
                {/* On mobile these move to .cart-item-actions below */}
                <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button onClick={() => updateCart(item.id, item.qty - 1)}
                    style={{ width: 18, height: 18, border: '1px solid #e7e5e4', borderRadius: 6, cursor: 'pointer', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateCart(item.id, item.qty + 1)}
                    style={{ width: 18, height: 18, border: '1px solid #e7e5e4', borderRadius: 6, cursor: 'pointer', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={12} />
                  </button>
                </div>
                <div className="cart-item-price">
                  <p style={{ fontWeight: 700, fontSize: 16, color: '#166534', margin: 0, marginLeft: 8 }}>₹{(item.price * item.qty).toFixed(2)}</p>
                </div>
                <button onClick={() => updateCart(item.id, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card cart-summary" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 20 }}>Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#78716c' }}>{item.name} × {item.qty}</span>
              <span>₹{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e7e5e4' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
            <span>Total</span>
            <span style={{ color: '#166534' }}>₹{total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/checkout', { state: { cart } })}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 }}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}