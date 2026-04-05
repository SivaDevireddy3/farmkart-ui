import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

// Core
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import SellerRoute from './components/SellerRoute'
import SuperAdminRoute from './components/SuperAdminRoute'

// Context
import { AuthProvider } from './context/AuthContext'

// Customer pages
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentPage from './pages/PaymentPage'
import OrderTrack from './pages/OrderTrack'
import Contact from './pages/Contact'

// User auth
import UserLogin from './pages/user/UserLogin'

// Seller pages
import SellerLogin from './pages/seller/SellerLogin'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerMangoes from './pages/seller/SellerMangoes'
import SellerChangePassword from './pages/seller/SellerChangePassword'

// Super Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMangoes from './pages/admin/AdminMangoes'
import AdminOrders from './pages/admin/AdminOrders'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import SuperAdminSellers from './pages/superadmin/SuperAdminSellers'

export default function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])

  const addToCart = (mango, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === mango.id)
      if (existing) return prev.map(i => i.id === mango.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...mango, qty }]
    })
  }

  const updateCart = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id))
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: 14 },
          duration: 3500,
        }}
      />
      <Navbar cartCount={cartCount} />
      <Routes>
        {/* ── Customer / Public ── */}
        <Route path="/" element={<Home addToCart={addToCart} cart={cart} clearCart={clearCart} />} />
        <Route path="/cart" element={<Cart cart={cart} updateCart={updateCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
        <Route path="/payment/:orderNumber" element={<PaymentPage />} />
        <Route path="/track" element={<OrderTrack />} />
        <Route path="/contact" element={<Contact />} />

        {/* ── User auth ── */}
        <Route path="/user/login" element={<UserLogin />} />

        {/* ── Seller ── */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/dashboard" element={
          <SellerRoute><SellerDashboard /></SellerRoute>
        } />
        <Route path="/seller/mangoes" element={
          <SellerRoute><SellerMangoes /></SellerRoute>
        } />
        <Route path="/seller/change-password" element={
          <SellerRoute><SellerChangePassword /></SellerRoute>
        } />

        {/* ── Super Admin (new routes) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/super-admin" element={
          <SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>
        } />
        <Route path="/super-admin/sellers" element={
          <SuperAdminRoute><SuperAdminSellers /></SuperAdminRoute>
        } />

        {/* ── Legacy Admin routes (kept for backward compat) ── */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/mangoes" element={
          <ProtectedRoute><AdminMangoes /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute><AdminOrders /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 72 }}>🥭</div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 28, margin: '16px 0 8px' }}>Page Not Found</h2>
            <p style={{ color: '#78716c', marginBottom: 24 }}>This page doesn't exist.</p>
            <a href="/" className="btn btn-primary">Go to Shop</a>
          </div>
        } />
      </Routes>
    </AuthProvider>
  )
}