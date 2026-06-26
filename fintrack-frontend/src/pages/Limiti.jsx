import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Plus, Trash2, Pencil } from 'lucide-react'

export default function Limiti() {
  const [limiti, setLimiti] = useState([])
  const [kategorije, setKategorije] = useState([])
  const [transakcije, setTransakcije] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editLimit, setEditLimit] = useState(null)
  const [form, setForm] = useState({ kategorija_id: '', iznos: '' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [lRes, kRes, tRes] = await Promise.all([
        api.get('/limiti'), api.get('/kategorije'), api.get('/transakcije')
      ])
      setLimiti(lRes.data.data || lRes.data)
      setKategorije(kRes.data.data || kRes.data)
      setTransakcije(tRes.data.data || tRes.data)
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editLimit) {
        await api.put(`/limiti/${editLimit.id}`, { iznos: form.iznos })
      } else {
        await api.post('/limiti', form)
      }
      setShowModal(false)
      setEditLimit(null)
      setForm({ kategorija_id: '', iznos: '' })
      fetchAll()
    } catch {}
  }

  const handleObrisi = async (id) => {
    if (!confirm('Obrisati limit?')) return
    await api.delete(`/limiti/${id}`)
    fetchAll()
  }

  const openEdit = (l) => {
    setEditLimit(l)
    setForm({ kategorija_id: l.kategorija_id, iznos: l.iznos })
    setShowModal(true)
  }

  const getPotroseno = (kategorija_id) =>
    transakcije.filter(t => t.kategorija_id == kategorija_id).reduce((s, t) => s + parseFloat(t.kolicina), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Limiti</h1>
        <button onClick={() => { setEditLimit(null); setForm({ kategorija_id: '', iznos: '' }); setShowModal(true) }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Postavi limit
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {limiti.length === 0 && <p className="text-slate-500">Nema postavljenih limita.</p>}
        {limiti.map(l => {
          const potroseno = getPotroseno(l.kategorija_id)
          const procenat = Math.min((potroseno / l.iznos) * 100, 100)
          return (
            <div key={l.id} className="bg-[#13141a] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium">{l.kategorija?.naziv}</p>
                  <p className="text-slate-500 text-sm">Limit: {parseFloat(l.iznos).toLocaleString()} RSD</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(l)} className="text-slate-500 hover:text-amber-400 transition"><Pencil size={15} /></button>
                  <button onClick={() => handleObrisi(l.id)} className="text-slate-500 hover:text-red-400 transition"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Potrošeno: {potroseno.toLocaleString()} RSD</span>
                <span className={procenat >= 100 ? 'text-red-400' : procenat >= 80 ? 'text-amber-400' : 'text-green-400'}>
                  {procenat.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full">
                <div
                  className={`h-2 rounded-full transition-all ${procenat >= 100 ? 'bg-red-500' : procenat >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${procenat}%` }}
                />
              </div>
              {procenat >= 80 && (
                <p className={`text-xs mt-2 ${procenat >= 100 ? 'text-red-400' : 'text-amber-400'}`}>
                  {procenat >= 100 ? '⚠️ Limit prekoračen!' : '⚠️ Blizu ste limita!'}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#13141a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">{editLimit ? 'Izmeni limit' : 'Postavi limit'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!editLimit && (
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Kategorija</label>
                  <select
                    value={form.kategorija_id}
                    onChange={e => setForm({ ...form, kategorija_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Izaberi kategoriju</option>
                    {kategorije.filter(k => k.tip === 'trosak').map(k => <option key={k.id} value={k.id}>{k.naziv}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Iznos limita (RSD)</label>
                <input
                  type="number"
                  value={form.iznos}
                  onChange={e => setForm({ ...form, iznos: e.target.value })}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg hover:bg-white/10 transition">Otkaži</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition">Sačuvaj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}