import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function ProtectedRoute() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" />
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex-1 min-w-0 md:ml-52 flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
