import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useCurrency } from '../context/CurrencyContext'
import { Plus, Search, Trash2 } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'

export default function Transakcije() {
  const [transakcije, setTransakcije] = useState([])
  const [kategorije, setKategorije] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKat, setFilterKat] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [ponavljajuce, setPonavljajuce] = useState([])
  const [form, setForm] = useState({
    kategorija_id: '',
    kolicina: '',
    datum: '',
    ponavljaj: false,
    ucestalost: 'mesecno',
    interval_vrednost: 1,
  })
  const [poruka, setPoruka] = useState('')
  const { currency, formatMoney } = useCurrency()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [tRes, kRes, rRes] = await Promise.all([
        api.get('/transakcije'),
        api.get('/kategorije'),
        api.get('/ponavljajuce-transakcije'),
      ])
      setTransakcije(tRes.data.data || tRes.data)
      setKategorije(kRes.data.data || kRes.data)
      setPonavljajuce(rRes.data.data || rRes.data)

    } catch {}
    setLoading(false)
  }

  const handleDodaj = async (e) => {
    e.preventDefault()
    try {
      const endpoint = form.ponavljaj ? '/ponavljajuce-transakcije' : '/transakcije'
      const payload = form.ponavljaj
        ? {
          kategorija_id: form.kategorija_id,
          kolicina: form.kolicina,
          ucestalost: form.ucestalost,
          interval_vrednost: form.interval_vrednost,
          sledeci_datum: form.datum,
        }
        : form
      const res = await api.post(endpoint, payload)
      setPoruka(res.data.upozorenje || 'Transakcija dodata!')
      setShowModal(false)
      setForm({ kategorija_id: '', kolicina: '', datum: '', ponavljaj: false, ucestalost: 'mesecno', interval_vrednost: 1 })
      await fetchAll()
    } catch {
      setPoruka('Greška pri dodavanju.')
    }
  }

  const handleObrisiPonavljajucu = async (id) => {
    if (!confirm('Obrisati ponavljajuću transakciju?')) return
    try {
      await api.delete(`/ponavljajuce-transakcije/${id}`)
      await fetchAll()
    } catch (error) {
      setPoruka(error.response?.data?.message || 'Brisanje ponavljajuće transakcije nije uspelo.')
    }
  }

  const handleObrisi = async (id) => {
    if (!confirm('Obrisati transakciju?')) return
    try {
      await api.delete(`/transakcije/${id}`)
      await fetchAll()
    } catch (error) {
      setPoruka(error.response?.data?.message || 'Brisanje transakcije nije uspelo.')
    }
  }

  const filtered = transakcije.filter(t => {
    const matchKat = filterKat ? t.kategorija_id == filterKat : true
    const matchSearch = search ? t.kategorija?.naziv?.toLowerCase().includes(search.toLowerCase()) : true
    const datesValid = !dateFrom || !dateTo || dateFrom <= dateTo
    const matchDateFrom = !datesValid || !dateFrom || t.datum >= dateFrom
    const matchDateTo = !datesValid || !dateTo || t.datum <= dateTo
    return matchKat && matchSearch && matchDateFrom && matchDateTo
  })
  const invalidDateRange = dateFrom && dateTo && dateFrom > dateTo
  const hasActiveFilters = search || filterKat || dateFrom || dateTo

  const clearFilters = () => {
    setSearch('')
    setFilterKat('')
    setDateFrom('')
    setDateTo('')
  }

  const sumCents = items => items.reduce((total, item) => total + Math.round((parseFloat(item.kolicina) || 0) * 100), 0) / 100
  const prihodi = sumCents(transakcije.filter(t => t.kategorija?.tip === 'prihod'))
  const troskovi = sumCents(transakcije.filter(t => t.kategorija?.tip === 'trosak'))

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupno transakcija</p>
          <p className="text-white text-2xl font-bold">{transakcije.length}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Prihodi</p>
          <p className="text-green-400 text-2xl font-bold">{formatMoney(prihodi)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Troškovi</p>
          <p className="text-red-400 text-2xl font-bold">{formatMoney(-troskovi, { sign: true })}</p>
        </div>
      </div>

      {/* Filteri */}
      <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
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
            className="w-full sm:w-auto bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg text-sm outline-none focus:border-amber-500"
          >
            <option value="">Sve kategorije</option>
            {kategorije.map(k => <option key={k.id} value={k.id}>{k.naziv}</option>)}
          </select>
          <label className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Od</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              aria-label="Od"
              className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-amber-500"
            />
          </label>
          <label className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Do</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              aria-label="Do"
              className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-amber-500"
            />
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white border border-white/10 px-3 py-2 rounded-lg text-sm transition"
            >
              Očisti filtere
            </button>
          )}
        </div>
        {invalidDateRange && (
          <p className="text-red-400 text-sm mt-3">Datum 'Od' ne može biti posle datuma 'Do'.</p>
        )}
        <p className="text-slate-500 text-sm mt-3">Prikazano {filtered.length} od {transakcije.length} transakcija</p>
      </div>

      {/* Tabela */}
      <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">OPIS</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">KATEGORIJA</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">DATUM</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">TIP</th>
              <th className="text-right text-slate-500 text-xs font-medium px-4 py-3">IZNOS ({currency})</th>
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
                  {formatMoney(t.kategorija?.tip === 'prihod' ? parseFloat(t.kolicina) : -parseFloat(t.kolicina), { sign: true })}
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

      {ponavljajuce.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl overflow-hidden overflow-x-auto mt-6">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-white font-semibold">Ponavljajuće transakcije</h2>
            <p className="text-slate-500 text-xs mt-1">Nove transakcije se automatski kreiraju na sledeći datum.</p>
          </div>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">KATEGORIJA</th>
                <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">IZNOS</th>
                <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">UČESTALOST</th>
                <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">SLEDEĆI DATUM</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ponavljajuce.map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white text-sm">{p.kategorija?.naziv}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{formatMoney(p.kolicina)}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {p.interval_vrednost > 1 ? `Svakih ${p.interval_vrednost} ${p.ucestalost === 'nedeljno' ? 'nedelja' : p.ucestalost === 'mesecno' ? 'meseci' : 'godina'}` : p.ucestalost === 'nedeljno' ? 'Jednom nedeljno' : p.ucestalost === 'mesecno' ? 'Jednom mesečno' : 'Jednom godišnje'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{p.sledeci_datum}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleObrisiPonavljajucu(p.id)} className="text-slate-600 hover:text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransactionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchAll}
      />
    </div>
  )
}