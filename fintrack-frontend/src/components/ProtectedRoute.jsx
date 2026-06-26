import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function ProtectedRoute() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" />
  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="flex-1 ml-52 p-6">
        <Outlet />
      </main>
    </div>
  )
}