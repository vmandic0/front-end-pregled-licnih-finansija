import { useState, useEffect } from 'react'
import api from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download } from 'lucide-react'

export default function Izvestaji() {
  const [tip, setTip] = useState('mesecni')
  const [mesec, setMesec] = useState(new Date().getMonth() + 1)
  const [godina, setGodina] = useState(new Date().getFullYear())
  const [podaci, setPodaci] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchIzvestaj = async () => {
    setLoading(true)
    try {
      const params = tip === 'mesecni' ? { mesec, godina } : { godina }
      const res = await api.get(`/izvestaj/${tip}`, { params })
      console.log(`Podaci za [${tip}]:`, res.data)
      setPodaci(res.data)
    } catch (err) {
      console.error('Greška pri dobavljanju izveštaja', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchIzvestaj()
  }, [tip, mesec, godina])

  const exportCSV = async () => {
    const params = tip === 'mesecni' ? { mesec, godina } : { godina }
    try {
      const res = await api.get(`/izvestaj/${tip}/csv`, { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `izvestaj-${tip}-${godina}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      console.error('Greška pri preuzimanju CSV')
    }
  }

  const exportPDF = async () => {
    const params = tip === 'mesecni' ? { mesec, godina } : { godina }
    try {
      const res = await api.get(`/izvestaj/${tip}/pdf`, { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `izvestaj-${tip}-${godina}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      console.error('Greška pri preuzimanju PDF')
    }
  }

  // DETEKCIJA PODATAKA I ZA X OSU I ZA STUBIĆE (Y OSU)
  const getChartData = () => {
    if (!podaci) return []

    if (tip === 'godisnji' && Array.isArray(podaci.meseci)) {
      return podaci.meseci.map((item, index) => {
        // 1. Određivanje naziva meseca na X osi
        const brojMeseca = item.mesec || (index + 1)
        const imeMeseca = new Date(0, brojMeseca - 1).toLocaleString('sr', { month: 'short' })
        
        // 2. Skeniranje svih mogućih naziva za PRIHODE unutar elementa
        const prihodiVrednost = 
          item.prihodi || 
          item.prihod || 
          item.ukupni_prihodi || 
          item.income || 
          item.revenue || 
          item.suma || 
          0

        // 3. Skeniranje svih mogućih naziva za TROŠKOVE unutar elementa
        const troskoviVrednost = 
          item.troskovi || 
          item.trosak || 
          item.ukupni_troskovi || 
          item.expenses || 
          item.rashodi || 
          item.rashod || 
          0

        return {
          name: imeMeseca,
          Prihodi: prihodiVrednost,
          Troškovi: troskoviVrednost
        }
      })
    }

    // Prikaz jedne kolone za Mesečni izveštaj
    if (tip === 'mesecni') {
      const mesecIme = new Date(0, Number(mesec) - 1).toLocaleString('sr', { month: 'short' })
      return [{
        name: `${mesecIme} ${godina}`,
        Prihodi: podaci.ukupni_prihodi || 0,
        Troškovi: podaci.ukupni_troskovi || 0
      }]
    }

    return []
  }

  const chartData = getChartData()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Finansijski izveštaji</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm px-4 py-2 rounded-lg transition">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm px-4 py-2 rounded-lg transition">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {['mesecni', 'godisnji'].map(t => (
              <button key={t} onClick={() => setTip(t)}
                className={`px-4 py-2 text-sm capitalize transition ${tip === t ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'mesecni' ? 'Mesečni izveštaj' : 'Godišnji izveštaj'}
              </button>
            ))}
          </div>
          
          {tip === 'mesecni' && (
            <select 
              value={mesec} 
              onChange={e => setMesec(Number(e.target.value))}
              className="bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg text-sm outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('sr', { month: 'long' })}
                </option>
              ))}
            </select>
          )}

          <select 
            value={godina} 
            onChange={e => setGodina(Number(e.target.value))}
            className="bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg text-sm outline-none"
          >
            {[2024, 2025, 2026].map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <button onClick={fetchIzvestaj} disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50">
            {loading ? 'Učitavanje...' : 'Generiši'}
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-400 text-sm py-4">Učitavanje podataka...</div>}

      {!loading && podaci && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
            <p className="text-white font-medium mb-4">Prihodi vs troškovi</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="Prihodi" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Troškovi" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
            <p className="text-white font-medium mb-4">Pregled</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-400">Ukupni prihodi</span>
                <span className="text-green-400 font-medium">{(podaci.ukupni_prihodi || 0).toLocaleString()} RSD</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-400">Ukupni troškovi</span>
                <span className="text-red-400 font-medium">{(podaci.ukupni_troskovi || 0).toLocaleString()} RSD</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-400">Bilans</span>
                <span className="text-white font-medium">{(podaci.bilans || 0).toLocaleString()} RSD</span>
              </div>
              {podaci.net_worth !== undefined && (
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Net worth</span>
                  <span className="text-amber-400 font-medium">{(podaci.net_worth || 0).toLocaleString()} RSD</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}