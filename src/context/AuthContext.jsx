import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('authUser')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const login = (data, role) => {
    // For CUSTOMER, backend returns customerId/name but not mobile.
    // We preserve the mobile from the login form by merging it in
    // via the UserLogin page passing it in data. As a safety net,
    // also store whatever the backend returns.
    const u = { ...data, role }
    setUser(u)
    localStorage.setItem('authUser', JSON.stringify(u))
    if (role === 'SUPER_ADMIN') localStorage.setItem('superAdminToken', data.token)
    else if (role === 'SELLER') localStorage.setItem('sellerToken', data.token)
    else if (role === 'CUSTOMER') localStorage.setItem('customerToken', data.token)
    // Legacy support — store as adminToken so ProtectedRoute still works for super admin
    if (role === 'SUPER_ADMIN') localStorage.setItem('adminToken', data.token)
  }

  const logout = (redirectTo = '/') => {
    localStorage.removeItem('authUser')
    localStorage.removeItem('superAdminToken')
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('customerToken')
    localStorage.removeItem('adminToken')
    setUser(null)
    window.location.href = redirectTo
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isSeller = user?.role === 'SELLER'
  const isCustomer = user?.role === 'CUSTOMER'

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperAdmin, isSeller, isCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)