import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Plus, Search, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'

export default function Transakcije() {
  const [transakcije, setTransakcije] = useState([])
  const [kategorije, setKategorije] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKat, setFilterKat] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ kategorija_id: '', kolicina: '', datum: '' })
  const [poruka, setPoruka] = useState('')
  const [kurs, setKurs] = useState(1)
  const [valuta, setValuta] = useState('RSD')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [tRes, kRes, pRes] = await Promise.all([
        api.get('/transakcije'),
        api.get('/kategorije'),
        api.get('/profil'),
      ])
      setTransakcije(tRes.data.data || tRes.data)
      setKategorije(kRes.data.data || kRes.data)

      const prefValuta = pRes.data.preferred_currency || 'RSD'
      setValuta(prefValuta)

      if (prefValuta !== 'RSD') {
        const kursRes = await api.post('/konvertuj', { iznos: 1, iz_valute: 'RSD', u_valutu: prefValuta })
        setKurs(kursRes.data.konvertovani_iznos)
      }
    } catch {}
    setLoading(false)
  }

  const konvertuj = (iznos) => (iznos * kurs).toLocaleString(undefined, { maximumFractionDigits: 2 })

  const handleDodaj = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/transakcije', form)
      setPoruka(res.data.upozorenje || 'Transakcija dodata!')
      setShowModal(false)
      setForm({ kategorija_id: '', kolicina: '', datum: '' })
      fetchAll()
    } catch {
      setPoruka('Greška pri dodavanju.')
    }
  }

  const handleObrisi = async (id) => {
    if (!confirm('Obrisati transakciju?')) return
    await api.delete(`/transakcije/${id}`)
    fetchAll()
  }

  const filtered = transakcije.filter(t => {
    const matchKat = filterKat ? t.kategorija_id == filterKat : true
    const matchSearch = search ? t.kategorija?.naziv?.toLowerCase().includes(search.toLowerCase()) : true
    return matchKat && matchSearch
  })

  const prihodi = transakcije.filter(t => t.kategorija?.tip === 'prihod').reduce((s, t) => s + parseFloat(t.kolicina), 0)
  const troskovi = transakcije.filter(t => t.kategorija?.tip === 'trosak').reduce((s, t) => s + parseFloat(t.kolicina), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Transakcije</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Dodaj
        </button>
      </div>

      {poruka && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-lg mb-4">
          {poruka}
        </div>
      )}

      {/* Stat kartice */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupno transakcija</p>
          <p className="text-white text-2xl font-bold">{transakcije.length}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Prihodi</p>
          <p className="text-green-400 text-2xl font-bold">{konvertuj(prihodi)} {valuta}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Troškovi</p>
          <p className="text-red-400 text-2xl font-bold">{konvertuj(troskovi)} {valuta}</p>
        </div>
      </div>

      {/* Filteri */}
      <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pretraži transakcije..."
              className="w-full bg-white/5 border border-white/10 text-white pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:border-amber-500 transition"
            />
          </div>
          <select
            value={filterKat}
            onChange={e => setFilterKat(e.target.value)}
            className="bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg text-sm outline-none focus:border-amber-500"
          >
            <option value="">Sve kategorije</option>
            {kategorije.map(k => <option key={k.id} value={k.id}>{k.naziv}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">OPIS</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">KATEGORIJA</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">DATUM</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">TIP</th>
              <th className="text-right text-slate-500 text-xs font-medium px-4 py-3">IZNOS ({valuta})</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-slate-500 text-sm text-center py-8">Učitavanje...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-slate-500 text-sm text-center py-8">Nema transakcija</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition">
                <td className="px-4 py-3 text-white text-sm">{t.kategorija?.naziv}</td>
                <td className="px-4 py-3 text-slate-400 text-sm">{t.kategorija?.tip === 'prihod' ? 'Prihod' : 'Troškovi'}</td>
                <td className="px-4 py-3 text-slate-400 text-sm">{t.datum}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${t.kategorija?.tip === 'prihod' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {t.kategorija?.tip === 'prihod' ? 'Prihod' : 'Trošak'}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${t.kategorija?.tip === 'prihod' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.kategorija?.tip === 'prihod' ? '+' : '-'}{konvertuj(parseFloat(t.kolicina))}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleObrisi(t.id)} className="text-slate-600 hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">Nova transakcija</h2>
            <form onSubmit={handleDodaj} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Kategorija</label>
                <select
                  value={form.kategorija_id}
                  onChange={e => setForm({ ...form, kategorija_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Izaberi kategoriju</option>
                  {kategorije.map(k => <option key={k.id} value={k.id}>{k.naziv} ({k.tip})</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Iznos (RSD)</label>
                <input
                  type="number"
                  value={form.kolicina}
                  onChange={e => setForm({ ...form, kolicina: e.target.value })}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Datum</label>
                <input
                  type="date"
                  value={form.datum}
                  onChange={e => setForm({ ...form, datum: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg hover:bg-white/10 transition">
                  Otkaži
                </button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition">
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}