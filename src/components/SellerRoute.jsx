import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SellerRoute({ children }) {
  const { isSeller } = useAuth()
  // Also check raw token in case context hasn't loaded yet
  const token = localStorage.getItem('sellerToken')
  const authUser = (() => { try { return JSON.parse(localStorage.getItem('authUser') || 'null') } catch { return null } })()

  if (!token && !isSeller) {
    return <Navigate to="/seller/login" replace />
  }
  if (authUser && authUser.role !== 'SELLER') {
    return <Navigate to="/seller/login" replace />
  }
  return children
}