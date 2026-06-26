import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Plus, Trash2, Tag } from 'lucide-react'

export default function Kategorije() {
  const { isAdmin } = useAuth()
  const [kategorije, setKategorije] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ naziv: '', tip: 'trosak' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchKategorije() }, [])

  const fetchKategorije = async () => {
    try {
      const res = await api.get('/kategorije')
      setKategorije(res.data.data || res.data)
    } catch {}
    setLoading(false)
  }

  const handleDodaj = async (e) => {
    e.preventDefault()
    try {
      await api.post('/kategorije', form)
      setShowModal(false)
      setForm({ naziv: '', tip: 'trosak' })
      fetchKategorije()
    } catch {}
  }

  const handleObrisi = async (id) => {
    if (!confirm('Obrisati kategoriju?')) return
    await api.delete(`/kategorije/${id}`)
    fetchKategorije()
  }

  const prihodi = kategorije.filter(k => k.tip === 'prihod')
  const troskovi = kategorije.filter(k => k.tip === 'trosak')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Kategorije</h1>
        {isAdmin() && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={16} /> Dodaj kategoriju
          </button>
        )}
      </div>

      {loading ? <p className="text-slate-400">Učitavanje...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[{ label: 'Prihodi', items: prihodi, color: 'green' }, { label: 'Troškovi', items: troskovi, color: 'red' }].map(({ label, items, color }) => (
            <div key={label} className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
              <p className="text-white font-medium mb-4">{label}</p>
              <div className="flex flex-col gap-2">
                {items.map(k => (
                  <div key={k.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className={color === 'green' ? 'text-green-400' : 'text-red-400'} />
                      <span className="text-slate-300 text-sm">{k.naziv}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${color === 'green' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {k.tip}
                      </span>
                      {isAdmin() && (
                        <button onClick={() => handleObrisi(k.id)} className="text-slate-600 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-slate-500 text-sm">Nema kategorija</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">Nova kategorija</h2>
            <form onSubmit={handleDodaj} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Naziv</label>
                <input
                  type="text"
                  value={form.naziv}
                  onChange={e => setForm({ ...form, naziv: e.target.value })}
                  placeholder="npr. Gorivo"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Tip</label>
                <select
                  value={form.tip}
                  onChange={e => setForm({ ...form, tip: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500"
                >
                  <option value="trosak">Trošak</option>
                  <option value="prihod">Prihod</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg hover:bg-white/10 transition">Otkaži</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition">Dodaj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}