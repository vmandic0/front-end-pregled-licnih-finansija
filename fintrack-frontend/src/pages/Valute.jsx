import { useEffect, useState } from 'react'
import api from '../api/axios'
import { ArrowRightLeft } from 'lucide-react'

export default function Valute() {
  const [valute, setValute] = useState([])
  const [form, setForm] = useState({ iznos: '', iz_valute: 'RSD', u_valutu: 'EUR' })
  const [rezultat, setRezultat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prefVal, setPrefVal] = useState('')
  const [poruka, setPoruka] = useState('')

  useEffect(() => { fetchValute() }, [])

  const fetchValute = async () => {
    try {
      const res = await api.get('/valute')
      setValute(res.data.valute || res.data)
    } catch {}
  }

  const handleKonvertuj = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/konvertuj', form)
      setRezultat(res.data)
    } catch {}
    setLoading(false)
  }

  const handlePromeniValutu = async () => {
    try {
      await api.post('/promeni-valutu', { valuta: prefVal })
      setPoruka(`Preferovana valuta promenjena na ${prefVal}`)
    } catch {}
  }

  const valutaOptions = valute.map(([kod, naziv]) => (
    <option key={kod} value={kod}>{naziv}</option>
  ))

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Valute</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Konvertor */}
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
          <p className="text-white font-medium mb-4">Konverzija valuta</p>
          <form onSubmit={handleKonvertuj} className="flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Iznos</label>
              <input type="number" value={form.iznos} onChange={e => setForm({ ...form, iznos: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="text-slate-400 text-sm mb-1 block">Iz</label>
                <select value={form.iz_valute} onChange={e => setForm({ ...form, iz_valute: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-3 rounded-lg outline-none focus:border-amber-500 text-sm">
                  {valutaOptions}
                </select>
              </div>
              <ArrowRightLeft size={16} className="text-slate-500 mt-5" />
              <div className="flex-1">
                <label className="text-slate-400 text-sm mb-1 block">U</label>
                <select value={form.u_valutu} onChange={e => setForm({ ...form, u_valutu: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-3 rounded-lg outline-none focus:border-amber-500 text-sm">
                  {valutaOptions}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Konvertujem...' : 'Konvertuj'}
            </button>
          </form>
          {rezultat && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-slate-400 text-sm">Rezultat</p>
              <p className="text-white text-xl font-bold">{rezultat.konvertovani_iznos} {rezultat.u_valutu}</p>
              <p className="text-slate-500 text-xs mt-1">Kurs: 1 {rezultat.iz_valute} = {rezultat.kurs} {rezultat.u_valutu}</p>
            </div>
          )}
        </div>

        {/* Promena preferovane valute */}
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
          <p className="text-white font-medium mb-4">Preferovana valuta</p>
          <p className="text-slate-400 text-sm mb-4">Izaberite valutu u kojoj će biti prikazane vaše finansije.</p>
          {poruka && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">{poruka}</div>}
          <div className="flex gap-3">
            <select value={prefVal} onChange={e => setPrefVal(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-3 rounded-lg outline-none focus:border-amber-500 text-sm">
              <option value="">Izaberi valutu</option>
              {valutaOptions}
            </select>
            <button onClick={handlePromeniValutu} disabled={!prefVal}
              className="bg-amber-500 hover:bg-amber-400 text-white text-sm px-4 py-3 rounded-lg transition disabled:opacity-50">
              Sačuvaj
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}