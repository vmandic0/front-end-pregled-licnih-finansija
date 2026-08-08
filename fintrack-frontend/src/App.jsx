import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import PremiumRoute from './components/PremiumRoute'
import AdminRoute from './components/AdminRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transakcije from './pages/Transakcije'
import Kategorije from './pages/Kategorije'
import Limiti from './pages/Limiti'
import Krediti from './pages/Krediti'
import Izvestaji from './pages/Izvestaji'
import GrupnaStednja from './pages/GrupnaStednja'
import Valute from './pages/Valute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminKorisnici from './pages/admin/AdminKorisnici'
import AdminAnalitika from './pages/admin/AdminAnalitika'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transakcije" element={<Transakcije />} />
              <Route path="/kategorije" element={<Kategorije />} />
              <Route path="/limiti" element={<Limiti />} />
              <Route path="/valute" element={<Valute />} />

              <Route element={<PremiumRoute />}>
                <Route path="/krediti" element={<Krediti />} />
                <Route path="/izvestaji" element={<Izvestaji />} />
                <Route path="/grupna-stednja" element={<GrupnaStednja />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/korisnici" element={<AdminKorisnici />} />
                <Route path="/admin/analitika" element={<AdminAnalitika />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}