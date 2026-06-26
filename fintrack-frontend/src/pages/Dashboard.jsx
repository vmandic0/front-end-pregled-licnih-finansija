import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Plus, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, isPremium } = useAuth()
  const [data, setData] = useState(null)
  const [transakcije, setTransakcije] = useState([])
  const [limiti, setLimiti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, lRes] = await Promise.all([
          api.get('/transakcije'),
          api.get('/limiti'),
        ])
        setTransakcije(tRes.data.data || tRes.data)
        setLimiti(lRes.data.data || lRes.data)

        if (isPremium()) {
          const nwRes = await api.get('/net-worth')
          setData(nwRes.data)
        }
      } catch {}
      setLoading(false)
    }
    fetchAll()
  }, [])

  const prihodi = transakcije.filter(t => t.kategorija?.tip === 'prihod').reduce((s, t) => s + parseFloat(t.kolicina), 0)
  const troskovi = transakcije.filter(t => t.kategorija?.tip === 'trosak').reduce((s, t) => s + parseFloat(t.kolicina), 0)
  const bilans = prihodi - troskovi
  const poslednje = [...transakcije].slice(0, 5)

  if (loading) return <div className="text-slate-400 p-8">Učitavanje...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {isPremium() && (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
              ⭐ Premium
            </span>
          )}
          <Link to="/transakcije" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={16} /> Nova transakcija
          </Link>
        </div>
      </div>

      {/* Stat kartice */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isPremium() && (
          <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">Net worth</p>
            <p className="text-white text-2xl font-bold">{(data?.net_worth || 0).toLocaleString()} RSD</p>
            <p className="text-green-400 text-xs mt-1">+12.3% ovaj mesec</p>
          </div>
        )}
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupni prihodi</p>
          <p className="text-green-400 text-2xl font-bold">{prihodi.toLocaleString()} RSD</p>
        </div>
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupni troškovi</p>
          <p className="text-red-400 text-2xl font-bold">{troskovi.toLocaleString()} RSD</p>
        </div>
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Bilans meseca</p>
          <p className={`text-2xl font-bold ${bilans >= 0 ? 'text-white' : 'text-red-400'}`}>{bilans.toLocaleString()} RSD</p>
          <p className="text-slate-500 text-xs mt-1">{bilans >= 0 ? 'Pozitivan bilans' : 'Negativan bilans'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Poslednje transakcije */}
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-white font-medium mb-4">Poslednje transakcije</p>
          <div className="flex flex-col gap-3">
            {poslednje.length === 0 && <p className="text-slate-500 text-sm">Nema transakcija</p>}
            {poslednje.map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    {t.kategorija?.tip === 'prihod' ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-white text-sm">{t.kategorija?.naziv || 'Kategorija'}</p>
                    <p className="text-slate-500 text-xs">{t.datum}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${t.kategorija?.tip === 'prihod' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.kategorija?.tip === 'prihod' ? '+' : '-'}{parseFloat(t.kolicina).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Limiti */}
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-white font-medium mb-4">Limiti</p>
          <div className="flex flex-col gap-4">
            {limiti.length === 0 && <p className="text-slate-500 text-sm">Nema postavljenih limita</p>}
            {limiti.map(l => {
              const potroseno = transakcije
                .filter(t => t.kategorija_id === l.kategorija_id)
                .reduce((s, t) => s + parseFloat(t.kolicina), 0)
              const procenat = Math.min((potroseno / l.iznos) * 100, 100)
              return (
                <div key={l.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{l.kategorija?.naziv}</span>
                    <span className="text-slate-400">{potroseno.toLocaleString()} / {parseFloat(l.iznos).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${procenat >= 100 ? 'bg-red-500' : procenat >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${procenat}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}