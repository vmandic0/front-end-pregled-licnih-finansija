import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useCurrency } from '../context/CurrencyContext'

function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function TransactionModal({ show, onClose, onSaved }) {
  const { currency } = useCurrency()
  const [kategorije, setKategorije] = useState([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [error, setError] = useState('')
  const [newCategory, setNewCategory] = useState({ naziv: '', tip: 'trosak' })
  const [form, setForm] = useState({
    kategorija_id: '',
    kolicina: '',
    datum: today(),
    ponavljaj: false,
    ucestalost: 'mesecno',
    interval_vrednost: 1,
  })

  useEffect(() => {
    if (show) {
      fetchCategories()
      setError('')
    } else {
      setShowNewCategory(false)
      setForm({
        kategorija_id: '',
        kolicina: '',
        datum: today(),
        ponavljaj: false,
        ucestalost: 'mesecno',
        interval_vrednost: 1,
      })
    }
  }, [show])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/kategorije')
      setKategorije(res.data.data || res.data)
    } catch {
      setError('Nije moguće učitati kategorije.')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/kategorije', newCategory)
      const added = res.data
      setKategorije(current => [...current, added].sort((a, b) => a.naziv.localeCompare(b.naziv)))
      setForm(current => ({ ...current, kategorija_id: String(added.id) }))
      setNewCategory({ naziv: '', tip: 'trosak' })
      setShowNewCategory(false)
    } catch (postError) {
      setError(postError.response?.data?.message || 'Dodavanje kategorije nije uspelo.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.kategorija_id === '__new__') {
      setError('Prvo sačuvajte novu kategoriju, pa tek onda dodajte transakciju.')
      return
    }
    setError('')
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
      await api.post(endpoint, payload)
      setForm({
        kategorija_id: '',
        kolicina: '',
        datum: today(),
        ponavljaj: false,
        ucestalost: 'mesecno',
        interval_vrednost: 1,
      })
      onSaved?.()
      onClose()
    } catch (postError) {
      setError(postError.response?.data?.message || 'Greška pri dodavanju.')
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-white font-semibold mb-4">Nova transakcija</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Kategorija</label>
            <select
              value={form.kategorija_id}
              onChange={e => {
                if (e.target.value === '__new__') {
                  setShowNewCategory(true)
                  setForm({ ...form, kategorija_id: '__new__' })
                } else {
                  setShowNewCategory(false)
                  setForm({ ...form, kategorija_id: e.target.value })
                }
              }}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
              required
            >
              <option value="">Izaberi kategoriju</option>
              {kategorije.map(k => <option key={k.id} value={k.id}>{k.naziv} ({k.tip})</option>)}
              <option value="__new__">+ Nova kategorija</option>
            </select>
          </div>

          {showNewCategory && (
            <div className="border border-amber-500/20 rounded-lg p-3 flex flex-col gap-3">
              <input
                type="text"
                value={newCategory.naziv}
                onChange={e => setNewCategory({ ...newCategory, naziv: e.target.value })}
                placeholder="Naziv nove kategorije"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg outline-none focus:border-amber-500"
                required
              />
              <select
                value={newCategory.tip}
                onChange={e => setNewCategory({ ...newCategory, tip: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg outline-none focus:border-amber-500"
                required
              >
                <option value="trosak">Trošak</option>
                <option value="prihod">Prihod</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                  setShowNewCategory(false)
                  setForm(current => ({ ...current, kategorija_id: '' }))
                }} className="flex-1 bg-white/5 text-slate-300 py-2 rounded-lg">Otkaži</button>
                <button type="button" onClick={handleAddCategory} className="flex-1 bg-amber-500 text-white py-2 rounded-lg">Sačuvaj kategoriju</button>
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Iznos ({currency})</label>
            <input type="number" value={form.kolicina} onChange={e => setForm({ ...form, kolicina: e.target.value })} placeholder="0" className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Datum</label>
            <input type="date" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
          </div>
          <label className="flex items-center gap-2 text-slate-300 text-sm">
            <input type="checkbox" checked={form.ponavljaj} onChange={e => setForm({ ...form, ponavljaj: e.target.checked })} className="accent-amber-500" />
            Ponavljajuća transakcija
          </label>
          {form.ponavljaj && (
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Ponavljaj svakih</label>
              <div className="flex gap-2 mb-3">
                <input type="number" min="1" max="365" value={form.interval_vrednost} onChange={e => setForm({ ...form, interval_vrednost: e.target.value })} className="w-24 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
                <span className="flex items-center text-slate-400 text-sm">
                  {form.ucestalost === 'nedeljno' ? 'nedelja' : form.ucestalost === 'mesecno' ? 'meseci' : 'godina'}
                </span>
              </div>
              <label className="text-slate-400 text-sm mb-1 block">Učestalost</label>
              <select value={form.ucestalost} onChange={e => setForm({ ...form, ucestalost: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500">
                <option value="nedeljno">Jednom nedeljno</option>
                <option value="mesecno">Jednom mesečno</option>
                <option value="godisnje">Jednom godišnje</option>
              </select>
            </div>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg hover:bg-white/10 transition">Otkaži</button>
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition">Dodaj</button>
          </div>
        </form>
      </div>
    </div>
  )
}
