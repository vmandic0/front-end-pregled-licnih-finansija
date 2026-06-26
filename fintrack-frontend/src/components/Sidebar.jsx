import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, ArrowLeftRight, Tag, Sliders,
  CreditCard, FileText, Users, BarChart2,
  Globe, LogOut, Star, PiggyBank, Sun, Moon
} from 'lucide-react'

const navItem = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all'
const activeItem = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white bg-white/10'

export default function Sidebar() {
  const { user, logout, isPremium, isAdmin } = useAuth()
  const { dark, toggleTema } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-[var(--bg-card)] border-r border-white/5 flex flex-col py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
          <span className="text-xs font-bold text-white">F</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">FinTrack</p>
          <p className="text-slate-500 text-xs">Pregled ličnih finansija</p>
        </div>
      </div>

      {/* Glavni meni */}
      <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mb-2">Glavni meni</p>
      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeItem : navItem}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/transakcije" className={({ isActive }) => isActive ? activeItem : navItem}>
          <ArrowLeftRight size={16} /> Transakcije
        </NavLink>
        <NavLink to="/kategorije" className={({ isActive }) => isActive ? activeItem : navItem}>
          <Tag size={16} /> Kategorije
        </NavLink>
        <NavLink to="/limiti" className={({ isActive }) => isActive ? activeItem : navItem}>
          <Sliders size={16} /> Limiti
        </NavLink>
      </nav>

      {/* Premium */}
      {(isPremium() || isAdmin()) && (
        <>
          <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mt-6 mb-2">Premium</p>
          <nav className="flex flex-col gap-1">
            <NavLink to="/krediti" className={({ isActive }) => isActive ? activeItem : navItem}>
              <CreditCard size={16} /> Krediti
            </NavLink>
            <NavLink to="/izvestaji" className={({ isActive }) => isActive ? activeItem : navItem}>
              <FileText size={16} /> Izveštaji
            </NavLink>
            <NavLink to="/grupna-stednja" className={({ isActive }) => isActive ? activeItem : navItem}>
              <PiggyBank size={16} /> Grupna štednja
            </NavLink>
            <NavLink to="/valute" className={({ isActive }) => isActive ? activeItem : navItem}>
              <Globe size={16} /> Valute
            </NavLink>
          </nav>
        </>
      )}

      {/* Admin */}
      {isAdmin() && (
        <>
          <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mt-6 mb-2">Admin</p>
          <nav className="flex flex-col gap-1">
            <NavLink to="/admin" className={({ isActive }) => isActive ? activeItem : navItem}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/admin/korisnici" className={({ isActive }) => isActive ? activeItem : navItem}>
              <Users size={16} /> Korisnici
            </NavLink>
            <NavLink to="/admin/analitika" className={({ isActive }) => isActive ? activeItem : navItem}>
              <BarChart2 size={16} /> Analitika
            </NavLink>
          </nav>
        </>
      )}

      {/* User info + logout */}
      <div className="mt-auto">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleTema}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-2"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 mb-2">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            {isPremium() && (
              <div className="flex items-center gap-1">
                <Star size={10} className="text-amber-400" />
                <span className="text-amber-400 text-xs">Premium</span>
              </div>
            )}
            {isAdmin() && <span className="text-purple-400 text-xs">Administrator</span>}
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut size={16} /> Odjavi se
        </button>
      </div>
    </aside>
  )
}