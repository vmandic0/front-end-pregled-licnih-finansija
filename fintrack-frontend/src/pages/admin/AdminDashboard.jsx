import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Users, ArrowLeftRight, Tag, Star, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [korisnici, setKorisnici] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, kRes] = await Promise.all([api.get('/admin/analitika'), api.get('/admin/korisnici')])
        setStats(aRes.data)
        setKorisnici((kRes.data.data || kRes.data).slice(0, 4))
      } catch {}
    }
    fetchAll()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Admin dashboard</h1>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">Administrator</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Ukupno korisnika', value: stats?.ukupno_korisnika, icon: <Users size={18} className="text-blue-400" /> },
          { label: 'Premium korisnika', value: stats?.ukupno_premium, icon: <Star size={18} className="text-amber-400" /> },
          { label: 'Transakcija', value: stats?.ukupno_transakcija, icon: <ArrowLeftRight size={18} className="text-green-400" /> },
          { label: 'Kategorija', value: stats?.ukupno_kategorija, icon: <Tag size={18} className="text-purple-400" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">{icon}<p className="text-slate-500 text-xs">{label}</p></div>
            <p className="text-white text-2xl font-bold">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-medium">Korisnici</p>
          <Link to="/admin/korisnici" className="text-amber-400 text-sm hover:underline">Svi korisnici →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-slate-500 text-xs font-medium px-2 py-2">KORISNIK</th>
              <th className="text-left text-slate-500 text-xs font-medium px-2 py-2">EMAIL</th>
              <th className="text-left text-slate-500 text-xs font-medium px-2 py-2">TIP</th>
              <th className="text-left text-slate-500 text-xs font-medium px-2 py-2">STATUS</th>
              <th className="text-left text-slate-500 text-xs font-medium px-2 py-2">AKCIJA</th>
            </tr>
          </thead>
          <tbody>
            {korisnici.map(k => (
              <tr key={k.id} className="border-b border-white/5">
                <td className="px-2 py-3 text-white text-sm">{k.name}</td>
                <td className="px-2 py-3 text-slate-400 text-sm">{k.email}</td>
                <td className="px-2 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${k.type === 'administrator' ? 'bg-purple-500/10 text-purple-400' : k.klijent?.premium_klijent ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                    {k.type === 'administrator' ? 'Admin' : k.klijent?.premium_klijent ? 'Premium' : 'Basic'}
                  </span>
                </td>
                <td className="px-2 py-3"><span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Aktivan</span></td>
                <td className="px-2 py-3">
                  <Link to="/admin/korisnici" className="text-slate-500 hover:text-amber-400 transition"><Pencil size={14} /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}