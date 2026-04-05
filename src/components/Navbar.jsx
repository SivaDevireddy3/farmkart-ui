import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Package, LogOut, LayoutDashboard,
  Menu, X, LogIn, Store, ChevronDown, User, Bell,
  Shield, Home, Phone
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ cartCount }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isSuperAdmin, isSeller, isCustomer } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropOpen, setUserDropOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = () => {
    setUserDropOpen(false)
    setMenuOpen(false)
    if (isSuperAdmin) logout('/admin/login')
    else if (isSeller) logout('/seller/login')
    else logout('/')
  }

  const isAdminZone = isSuperAdmin || isSeller

  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 251, 240, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(231, 229, 228, 0.8);
          transition: box-shadow 0.3s ease;
        }
        .navbar.scrolled {
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .nav-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .nav-logo-emoji {
          font-size: 28px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(245,158,11,0.3));
        }
        .nav-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 800;
          color: #1c1917;
          letter-spacing: -0.5px;
        }
        .nav-logo-text span {
          color: #f59e0b;
        }
        /* Zone badge shown when in admin/seller mode */
        .nav-zone-badge {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 2px;
        }
        .nav-zone-badge.seller { background: #dcfce7; color: #166534; }
        .nav-zone-badge.superadmin { background: #ede9fe; color: #7c3aed; }

        /* Desktop links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #57534e;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          border: none;
          background: none;
          cursor: pointer;
        }
        .nav-link:hover {
          background: #fef3c7;
          color: #92400e;
        }
        .nav-link.active {
          background: #fef3c7;
          color: #92400e;
          font-weight: 600;
        }

        /* Cart button */
        .nav-cart-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f59e0b;
          color: white;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.15s, transform 0.15s;
          position: relative;
          text-decoration: none;
        }
        .nav-cart-btn:hover {
          background: #d97706;
          transform: translateY(-1px);
        }
        .nav-cart-badge {
          background: white;
          color: #d97706;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          animation: cartPop 0.3s ease;
        }
        @keyframes cartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        /* User dropdown */
        .nav-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 8px;
          background: white;
          border: 1.5px solid #e7e5e4;
          border-radius: 24px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1c1917;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nav-user-btn:hover {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .nav-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          min-width: 200px;
          padding: 8px;
          z-index: 200;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #44403c;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          transition: background 0.12s;
        }
        .nav-dropdown-item:hover { background: #fafaf9; }
        .nav-dropdown-item.danger { color: #dc2626; }
        .nav-dropdown-item.danger:hover { background: #fff5f5; }
        .nav-dropdown-divider {
          height: 1px;
          background: #f5f5f4;
          margin: 6px 0;
        }
        .nav-dropdown-header {
          padding: 8px 12px 4px;
          font-size: 11px;
          font-weight: 700;
          color: #a8a29e;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        /* Hamburger */
        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: #44403c;
          transition: background 0.15s;
        }
        .nav-hamburger:hover { background: #fef3c7; }

        /* Mobile cart icon */
        .nav-mobile-cart {
          display: none;
          position: relative;
          text-decoration: none;
          padding: 6px;
          border-radius: 8px;
          color: #44403c;
          transition: background 0.15s;
        }
        .nav-mobile-cart:hover { background: #fef3c7; }
        .nav-mobile-cart-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          background: #f59e0b;
          color: white;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mobile menu drawer */
        .nav-mobile-menu {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 99;
          pointer-events: none;
        }
        .nav-mobile-menu.open {
          pointer-events: auto;
        }
        .nav-mobile-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.3s ease;
        }
        .nav-mobile-menu.open .nav-mobile-overlay {
          background: rgba(0,0,0,0.35);
        }
        .nav-mobile-drawer {
          position: absolute;
          top: 64px;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid #e7e5e4;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          transform: translateY(-110%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: calc(100vh - 64px);
          overflow-y: auto;
        }
        .nav-mobile-menu.open .nav-mobile-drawer {
          transform: translateY(0);
        }
        .nav-mobile-section {
          padding: 8px 16px;
        }
        .nav-mobile-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #a8a29e;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 12px 4px 4px;
        }
        .nav-mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #44403c;
          transition: background 0.12s;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .nav-mobile-link:hover, .nav-mobile-link:active { background: #fafaf9; }
        .nav-mobile-link.highlight { color: #f59e0b; font-weight: 700; }
        .nav-mobile-link.danger { color: #dc2626; }
        .nav-mobile-divider { height: 1px; background: #f5f5f4; margin: 4px 0; }
        .nav-mobile-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          margin: 8px 16px;
          border-radius: 14px;
        }
        .nav-mobile-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .nav-mobile-cart-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          margin: 0 0 4px;
          background: #f59e0b;
          border-radius: 14px;
          text-decoration: none;
          margin: 8px 16px;
        }
        .nav-mobile-cart-row span {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: white;
        }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-hamburger { display: flex; }
          .nav-mobile-cart { display: flex; align-items: center; }
          .nav-mobile-menu { display: block; }
        }
        @media (max-width: 480px) {
          .navbar-inner { padding: 0 16px; }
          .nav-logo-text { font-size: 19px; }
        }
      `}</style>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to={isSuperAdmin ? '/super-admin' : isSeller ? '/seller/dashboard' : '/'} className="nav-logo">
            <span className="nav-logo-emoji">🥭</span>
            <span className="nav-logo-text">Mango<span>Mart</span></span>
            {isSeller && <span className="nav-zone-badge seller">Seller</span>}
            {isSuperAdmin && <span className="nav-zone-badge superadmin">Super Admin</span>}
          </Link>

          {/* Desktop links */}
          <div className="nav-links">

            {/* ── Customer / Guest links ── */}
            {!isAdminZone && (
              <>
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  <Home size={15} /> Shop
                </Link>
                <Link to="/track" className={`nav-link ${location.pathname === '/track' ? 'active' : ''}`}>
                  <Package size={15} /> Track Order
                </Link>
                <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                  <Phone size={15} /> Contact
                </Link>
              </>
            )}

            {/* ── Seller links ── */}
            {isSeller && (
              <>
                <Link to="/seller/dashboard" className={`nav-link ${location.pathname === '/seller/dashboard' ? 'active' : ''}`}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <Link to="/seller/mangoes" className={`nav-link ${location.pathname === '/seller/mangoes' ? 'active' : ''}`}>
                  <Store size={15} /> My Mangoes
                </Link>
              </>
            )}

            {/* ── Super admin links ── */}
            {isSuperAdmin && (
              <>
                <Link to="/super-admin" className={`nav-link ${location.pathname === '/super-admin' ? 'active' : ''}`}>
                  <LayoutDashboard size={15} /> Overview
                </Link>
                <Link to="/super-admin/sellers" className={`nav-link ${location.pathname === '/super-admin/sellers' ? 'active' : ''}`}>
                  <Store size={15} /> Manage Sellers
                </Link>
              </>
            )}

            {/* ── Logged-in user dropdown ── */}
            {(isCustomer || isAdminZone) ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button className="nav-user-btn" onClick={() => setUserDropOpen(v => !v)}>
                  <div className="nav-user-avatar">
                    {isSuperAdmin ? '🛡️' : isSeller ? '🏪' : '👤'}
                  </div>
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isSuperAdmin
                      ? (user?.username || 'Admin')
                      : isSeller
                        ? (user?.storeName || 'My Store')
                        : (user?.name || user?.mobile || 'Account')}
                  </span>
                  <ChevronDown size={14} style={{ color: '#a8a29e', flexShrink: 0, transition: 'transform 0.2s', transform: userDropOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {userDropOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      {isSuperAdmin ? 'Super Admin' : isSeller ? 'Seller Account' : 'My Account'}
                    </div>
                    <div style={{ padding: '2px 12px 8px', fontSize: 12, color: '#78716c' }}>
                      {isSeller ? user?.mobile : isCustomer ? user?.mobile : user?.username}
                    </div>
                    <div className="nav-dropdown-divider" />

                    {isCustomer && (
                      <>
                        <Link to="/my-orders" className="nav-dropdown-item" onClick={() => setUserDropOpen(false)}>
                          <Package size={15} /> My Orders
                        </Link>
                        <div className="nav-dropdown-divider" />
                      </>
                    )}

                    {isSeller && !user?.passwordChanged && (
                      <>
                        <Link to="/seller/change-password" className="nav-dropdown-item" style={{ color: '#f59e0b' }} onClick={() => setUserDropOpen(false)}>
                          <Bell size={15} /> Change Default Password
                        </Link>
                        <div className="nav-dropdown-divider" />
                      </>
                    )}

                    <button className="nav-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest — show login button */
              <Link to="/user/login">
                <button className="nav-link" style={{ color: '#1c1917', fontWeight: 600 }}>
                  <LogIn size={15} /> Login
                </button>
              </Link>
            )}

            {/* ── Seller / Admin login link ── */}
            {!isAdminZone && !isCustomer && (
              <Link to="/seller/login" className="nav-link" style={{ fontSize: 12, color: '#a8a29e' }}>
                Seller
              </Link>
            )}

            {/* ── Cart (guests + customers only) ── */}
            {!isAdminZone && (
              <Link to="/cart" className="nav-cart-btn">
                <ShoppingCart size={17} />
                Cart
                {cartCount > 0 && (
                  <span className="nav-cart-badge" key={cartCount}>{cartCount}</span>
                )}
              </Link>
            )}
          </div>

          {/* Mobile right side */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {!isAdminZone && (
              <Link to="/cart" className="nav-mobile-cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="nav-mobile-cart-dot">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </Link>
            )}
            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="nav-mobile-overlay" onClick={() => setMenuOpen(false)} />
        <div className="nav-mobile-drawer">

          {/* Logged-in user card */}
          {(isCustomer || isAdminZone) && (
            <div className="nav-mobile-user-card">
              <div className="nav-mobile-user-avatar">
                {isSuperAdmin ? '🛡️' : isSeller ? '🏪' : '👤'}
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 15 }}>
                  {isSuperAdmin ? (user?.username || 'Admin') : isSeller ? user?.storeName : (user?.name || 'My Account')}
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#92400e' }}>
                  {isSeller ? user?.mobile : isCustomer ? user?.mobile : 'Super Admin'}
                </p>
              </div>
            </div>
          )}

          {/* Cart row for customers/guests */}
          {!isAdminZone && (
            <Link to="/cart" className="nav-mobile-cart-row" onClick={() => setMenuOpen(false)}>
              <span><ShoppingCart size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Cart</span>
              {cartCount > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 13 }}>
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              )}
            </Link>
          )}

          <div className="nav-mobile-section">

            {/* Customer/Guest links */}
            {!isAdminZone && (
              <>
                <div className="nav-mobile-section-label">Shop</div>
                <Link to="/" className="nav-mobile-link highlight" onClick={() => setMenuOpen(false)}>
                  <Home size={18} /> Browse Mangoes
                </Link>
                <Link to="/track" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <Package size={18} /> Track Order
                </Link>
                <Link to="/contact" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <Phone size={18} /> Contact Store
                </Link>
                <div className="nav-mobile-divider" />
              </>
            )}

            {/* Seller links */}
            {isSeller && (
              <>
                <div className="nav-mobile-section-label">Seller</div>
                <Link to="/seller/dashboard" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/seller/mangoes" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <Store size={18} /> My Mangoes
                </Link>
                <div className="nav-mobile-divider" />
              </>
            )}

            {/* Super admin links */}
            {isSuperAdmin && (
              <>
                <div className="nav-mobile-section-label">Super Admin</div>
                <Link to="/super-admin" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={18} /> Overview
                </Link>
                <Link to="/super-admin/sellers" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <Store size={18} /> Manage Sellers
                </Link>
                <div className="nav-mobile-divider" />
              </>
            )}

            {/* Account actions */}
            {(isCustomer || isAdminZone) ? (
              <>
                {isCustomer && (
                  <Link to="/my-orders" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                    <Package size={18} /> My Orders
                  </Link>
                )}
                <button className="nav-mobile-link danger" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="nav-mobile-section-label">Account</div>
                <Link to="/user/login" className="nav-mobile-link highlight" onClick={() => setMenuOpen(false)}>
                  <LogIn size={18} /> Login / Register
                </Link>
                <Link to="/seller/login" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  <Store size={18} /> Seller Login
                </Link>
                <Link to="/admin/login" className="nav-mobile-link" style={{ color: '#a8a29e', fontSize: 13 }} onClick={() => setMenuOpen(false)}>
                  <Shield size={16} /> Admin Login
                </Link>
              </>
            )}
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>
    </>
  )
}