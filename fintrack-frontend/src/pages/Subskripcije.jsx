import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Plus, Repeat2, Trash2, Pencil } from 'lucide-react'

const emptyForm = {
  naziv: '',
  iznos: '',
  valuta: 'EUR',
  dan_naplate: 1,
  kategorija_id: '',
  aktivna: true,
}

export default function Subskripcije() {
  const [subskripcije, setSubskripcije] = useState([])
  const [popularne, setPopularne] = useState([])
  const [kategorije, setKategorije] = useState([])
  const [valute, setValute] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [customName, setCustomName] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [poruka, setPoruka] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [sRes, pRes, kRes, vRes] = await Promise.all([
        api.get('/subskripcije'),
        api.get('/subskripcije/popularne'),
        api.get('/kategorije'),
        api.get('/valute'),
      ])
      setSubskripcije(sRes.data.data || sRes.data)
      setPopularne(pRes.data)
      setKategorije((kRes.data.data || kRes.data).filter(k => k.tip === 'trosak'))
      setValute(vRes.data.valute || vRes.data)
    } catch {
      setPoruka('Nije moguće učitati subskripcije.')
    }
  }

  const openAdd = () => {
    setEditId(null)
    setCustomName(false)
    setForm(emptyForm)
    setPoruka('')
    setShowModal(true)
  }

  const openEdit = (sub) => {
    setEditId(sub.id)
    setCustomName(true)
    setForm({
      naziv: sub.naziv,
      iznos: sub.iznos,
      valuta: sub.valuta,
      dan_naplate: sub.dan_naplate,
      kategorija_id: sub.kategorija_id,
      aktivna: sub.aktivna,
    })
    setPoruka('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPoruka('')
    try {
      if (editId) {
        await api.put(`/subskripcije/${editId}`, form)
      } else {
        await api.post('/subskripcije', form)
      }
      setShowModal(false)
      await fetchAll()
    } catch (error) {
      setPoruka(error.response?.data?.message || 'Čuvanje subskripcije nije uspelo.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Obrisati subskripciju?')) return
    try {
      await api.delete(`/subskripcije/${id}`)
      await fetchAll()
    } catch {
      setPoruka('Brisanje subskripcije nije uspelo.')
    }
  }

  const changeName = (value) => {
    if (value === '__custom__') {
      setCustomName(true)
      setForm({ ...form, naziv: '' })
      return
    }
    const selected = popularne.find(item => item.naziv === value)
    setCustomName(false)
    setForm({ ...form, naziv: value, valuta: selected?.valuta || form.valuta })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Subskripcije</h1>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Dodaj subskripciju
        </button>
      </div>

      {poruka && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-lg mb-4">
          {poruka}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subskripcije.map(sub => (
          <div key={sub.id} className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Repeat2 size={17} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{sub.naziv}</p>
                  <p className="text-slate-500 text-xs">{sub.kategorija?.naziv}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(sub)} className="text-slate-500 hover:text-amber-400"><Pencil size={15} /></button>
                <button type="button" onClick={() => handleDelete(sub.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-white text-xl font-bold">
                  {sub.iznos_u_preferiranoj_valuti} {sub.preferirana_valuta}
                </p>
                <p className="text-slate-500 text-xs">
                  {sub.iznos} {sub.valuta} · naplata {sub.dan_naplate}. u mesecu
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${sub.aktivna ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                {sub.aktivna ? 'Aktivna' : 'Neaktivna'}
              </span>
            </div>
          </div>
        ))}
        {subskripcije.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 text-slate-500 text-sm bg-[var(--bg-card)] border border-white/5 rounded-xl p-6">
            Nemate dodate subskripcije.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-semibold mb-4">{editId ? 'Izmeni subskripciju' : 'Nova subskripcija'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Naziv</label>
                {!customName && !editId ? (
                  <select value={form.naziv} onChange={e => changeName(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required>
                    <option value="">Izaberi subskripciju</option>
                    {popularne.map(item => <option key={item.naziv} value={item.naziv}>{item.naziv}</option>)}
                    <option value="__custom__">+ Custom subskripcija</option>
                  </select>
                ) : (
                  <input type="text" value={form.naziv} onChange={e => setForm({ ...form, naziv: e.target.value })} placeholder="Naziv subskripcije" className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 text-sm mb-1 block">Iznos</label>
                  <input type="number" min="0.01" step="0.01" value={form.iznos} onChange={e => setForm({ ...form, iznos: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Valuta</label>
                  <select value={form.valuta} onChange={e => setForm({ ...form, valuta: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white px-2 py-3 rounded-lg outline-none focus:border-amber-500" required>
                    {(valute.length ? valute.map(v => v[0]) : ['RSD', 'EUR', 'USD', 'GBP']).map(code => <option key={code} value={code}>{code}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Datum naplate</label>
                <input type="number" min="1" max="28" value={form.dan_naplate} onChange={e => setForm({ ...form, dan_naplate: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Kategorija troška</label>
                <select value={form.kategorija_id} onChange={e => setForm({ ...form, kategorija_id: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required>
                  <option value="">Izaberi kategoriju</option>
                  {kategorije.map(k => <option key={k.id} value={k.id}>{k.naziv}</option>)}
                </select>
              </div>
              {editId && (
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <input type="checkbox" checked={form.aktivna} onChange={e => setForm({ ...form, aktivna: e.target.checked })} className="accent-amber-500" />
                  Aktivna subskripcija
                </label>
              )}
              {poruka && <p className="text-red-400 text-sm">{poruka}</p>}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg">Otkaži</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg">Sačuvaj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
