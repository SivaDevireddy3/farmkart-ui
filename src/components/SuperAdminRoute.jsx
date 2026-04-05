import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SuperAdminRoute({ children }) {
  const { isSuperAdmin } = useAuth()
  const token = localStorage.getItem('superAdminToken') || localStorage.getItem('adminToken')
  const authUser = (() => { try { return JSON.parse(localStorage.getItem('authUser') || 'null') } catch { return null } })()

  if (!token && !isSuperAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  if (authUser && authUser.role !== 'SUPER_ADMIN') {
    return <Navigate to="/admin/login" replace />
  }
  return children
}