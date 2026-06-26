import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Plus, Trash2, Pencil, CreditCard } from 'lucide-react'

export default function Krediti() {
  const [krediti, setKrediti] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editKredit, setEditKredit] = useState(null)
  const [form, setForm] = useState({ pozajmljenaCifra: '', kamatnaStopa: '', mesecnaRata: '' })

  useEffect(() => { fetchKrediti() }, [])

  const fetchKrediti = async () => {
    try {
      const res = await api.get('/krediti')
      setKrediti(res.data.data || res.data)
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editKredit) {
        await api.patch(`/krediti/${editKredit.id}`, { mesecnaRata: form.mesecnaRata })
      } else {
        await api.post('/krediti', form)
      }
      setShowModal(false)
      setEditKredit(null)
      setForm({ pozajmljenaCifra: '', kamatnaStopa: '', mesecnaRata: '' })
      fetchKrediti()
    } catch {}
  }

  const handleObrisi = async (id) => {
    if (!confirm('Obrisati kredit?')) return
    await api.delete(`/krediti/${id}`)
    fetchKrediti()
  }

  const ukupanDug = krediti.reduce((s, k) => s + parseFloat(k.pozajmljenaCifra || 0), 0)
  const mesecnaObaveza = krediti.reduce((s, k) => s + parseFloat(k.mesecnaRata || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Krediti</h1>
        <button onClick={() => { setEditKredit(null); setForm({ pozajmljenaCifra: '', kamatnaStopa: '', mesecnaRata: '' }); setShowModal(true) }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Dodaj kredit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupan dug</p>
          <p className="text-red-400 text-2xl font-bold">{ukupanDug.toLocaleString()} RSD</p>
        </div>
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Broj kredita</p>
          <p className="text-white text-2xl font-bold">{krediti.length}</p>
        </div>
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Mes. obaveza</p>
          <p className="text-white text-2xl font-bold">{mesecnaObaveza.toLocaleString()} RSD</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {krediti.length === 0 && <p className="text-slate-500">Nema kredita.</p>}
        {krediti.map(k => {
          const ukupno = parseFloat(k.pozajmljenaCifra) * (1 + parseFloat(k.kamatnaStopa) / 100)
          const meseci = k.meseci_do_otplate || Math.ceil(ukupno / parseFloat(k.mesecnaRata))
          const otplaceno = Math.max(0, 100 - (meseci / (ukupno / parseFloat(k.mesecnaRata))) * 100)
          return (
            <div key={k.id} className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <CreditCard size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{parseFloat(k.pozajmljenaCifra).toLocaleString()} RSD</p>
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Aktivan</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditKredit(k); setForm({ ...form, mesecnaRata: k.mesecnaRata }); setShowModal(true) }}
                    className="text-slate-500 hover:text-amber-400 transition"><Pencil size={15} /></button>
                  <button onClick={() => handleObrisi(k.id)} className="text-slate-500 hover:text-red-400 transition"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Kamata</p>
                  <p className="text-white">{k.kamatnaStopa}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Mes. rata</p>
                  <p className="text-white">{parseFloat(k.mesecnaRata).toLocaleString()} RSD</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Do otplate</p>
                  <p className="text-white">{meseci} mes.</p>
                </div>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Otplaćeno</span>
                <span className="text-slate-400">{otplaceno.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full">
                <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${otplaceno}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">{editKredit ? 'Izmeni ratu' : 'Dodaj kredit'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!editKredit && (
                <>
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Pozajmljena cifra (RSD)</label>
                    <input type="number" value={form.pozajmljenaCifra} onChange={e => setForm({ ...form, pozajmljenaCifra: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Kamatna stopa (%)</label>
                    <input type="number" step="0.1" value={form.kamatnaStopa} onChange={e => setForm({ ...form, kamatnaStopa: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
                  </div>
                </>
              )}
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Mesečna rata (RSD)</label>
                <input type="number" value={form.mesecnaRata} onChange={e => setForm({ ...form, mesecnaRata: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
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