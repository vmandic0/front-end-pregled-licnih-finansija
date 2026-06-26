import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PremiumRoute() {
  const { isPremium, isAdmin } = useAuth()
  if (!isPremium() && !isAdmin()) return <Navigate to="/dashboard" />
  return <Outlet />
}