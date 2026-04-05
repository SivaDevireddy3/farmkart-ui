import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL

/**
 * Returns the most-appropriate token for the current user's role.
 * Priority: super admin → seller → customer.
 * Having a stale token from a previous session can cause 403s, so the
 * 401 interceptor below clears them on first failure.
 */
const getToken = () =>
  localStorage.getItem('superAdminToken') ||
  localStorage.getItem('adminToken') ||
  localStorage.getItem('sellerToken') ||
  localStorage.getItem('customerToken')

// ── Authenticated client ──────────────────────────────────────────────────────
const API = axios.create({ baseURL: BASE })

API.interceptors.request.use(cfg => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      if (path.startsWith('/super-admin') || path.startsWith('/admin')) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('superAdminToken')
        localStorage.removeItem('authUser')
        window.location.href = '/admin/login'
      } else if (path.startsWith('/seller')) {
        localStorage.removeItem('sellerToken')
        localStorage.removeItem('authUser')
        window.location.href = '/seller/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Public client (no auth) ───────────────────────────────────────────────────
const PUBLIC = axios.create({ baseURL: BASE })

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  // Legacy — backward compat
  login: (d) => PUBLIC.post('/auth/login', d),
  // Multi-role
  adminLogin: (d) => PUBLIC.post('/auth/admin/login', d),
  sellerLogin: (d) => PUBLIC.post('/auth/seller/login', d),
  customerLogin: (d) => PUBLIC.post('/auth/customer/login', d),
  customerRegister: (d) => PUBLIC.post('/auth/customer/register', d),
  sellerChangePass: (d) => API.post('/auth/seller/change-password', d),
  verify: () => API.get('/auth/verify'),
}

// ── Mangoes ───────────────────────────────────────────────────────────────────
export const mangoAPI = {
  // Public
  getAll: (p) => PUBLIC.get('/mangoes', { params: p }),
  getOne: (id) => PUBLIC.get(`/mangoes/${id}`),
  getCategories: (p) => PUBLIC.get('/mangoes/categories', { params: p }),
  // Authenticated mutations (seller or super admin)
  create: (d) => API.post('/mangoes', d),
  update: (id, d) => API.put(`/mangoes/${id}`, d),
  delete: (id) => API.delete(`/mangoes/${id}`),
  toggle: (id) => API.patch(`/mangoes/${id}/toggle`),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  // Public
  place: (d) => PUBLIC.post('/orders', d),
  track: (n) => PUBLIC.get(`/orders/track/${n}`),
  updatePayment: (n, d) => PUBLIC.patch(`/orders/${n}/payment`, d),
  // Seller / Admin
  getAll: (p) => API.get('/orders', { params: p }),
  getOne: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, d) => API.patch(`/orders/${id}/status`, d),
  markDelivered: (id) => API.patch(`/orders/${id}/deliver`),
  getStats: () => API.get('/orders/stats/summary'),
  // Customer
  getMyOrders: () => API.get('/orders/my'),
}

// ── Sellers (super admin) ─────────────────────────────────────────────────────
export const sellerAPI = {
  getAll: () => API.get('/sellers'),
  getOne: (id) => API.get(`/sellers/${id}`),
  getPublic: (id) => PUBLIC.get(`/sellers/${id}/public`),
  getActive: () => PUBLIC.get('/sellers/active'),
  create: (d) => API.post('/sellers', d),
  update: (id, d) => API.put(`/sellers/${id}`, d),
  toggle: (id) => API.patch(`/sellers/${id}/toggle`),
  resetPassword: (id) => API.post(`/sellers/${id}/reset-password`),
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  // Public
  getForMango: (id) => PUBLIC.get(`/reviews/mango/${id}`),
  submit: (d) => PUBLIC.post('/reviews', d),
  // Admin / Seller
  getPending: () => API.get('/reviews/pending'),
  approve: (id) => API.patch(`/reviews/${id}/approve`),
  delete: (id) => API.delete(`/reviews/${id}`),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (n) => PUBLIC.post('/payments/create-order', { orderNumber: n }),
  verify: (d) => PUBLIC.post('/payments/verify', d),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markRead: () => API.post('/notifications/mark-read'),
}

// FIX Bug 12: removed settingsAPI and couponAPI — those backend controllers
// do not exist. Any page calling them would receive 404. If you add those
// controllers later, re-add the exports here.

export default API