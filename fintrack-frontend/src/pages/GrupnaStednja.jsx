import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Plus, Users } from 'lucide-react'

export default function GrupnaStednja() {
  const [grupe, setGrupe] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showUplataModal, setShowUplataModal] = useState(false)
  const [selectedGrupa, setSelectedGrupa] = useState(null)
  const [form, setForm] = useState({ naziv: '', ciljIznos: '', clanovi: '' })
  const [uplataForm, setUplataForm] = useState({ iznosUdela: '', datumUplate: '' })

  useEffect(() => { fetchGrupe() }, [])

  const fetchGrupe = async () => {
    try {
      const res = await api.get('/grupe')
      setGrupe(res.data.data || res.data)
    } catch {}
  }

  const handleKreiraj = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        naziv: form.naziv,
        ciljIznos: form.ciljIznos,
        clanovi: form.clanovi ? form.clanovi.split(',').map(s => s.trim()) : []
      }
      await api.post('/grupe', payload)
      setShowModal(false)
      setForm({ naziv: '', ciljIznos: '', clanovi: '' })
      fetchGrupe()
    } catch {}
  }

  const handleUplata = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/grupe/${selectedGrupa.id}/uplati`, uplataForm)
      setShowUplataModal(false)
      setUplataForm({ iznosUdela: '', datumUplate: '' })
      fetchGrupe()
    } catch {}
  }

  const ukupnoPrikupljeno = grupe.reduce((s, g) => s + parseFloat(g.trenutnoPrikupljeno || 0), 0)
  const ukupniCilj = grupe.reduce((s, g) => s + parseFloat(g.ciljIznos || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Grupna štednja</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Nova grupa
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Aktivne grupe</p>
          <p className="text-white text-2xl font-bold">{grupe.length}</p>
        </div>
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupno prikupljeno</p>
          <p className="text-amber-400 text-2xl font-bold">{ukupnoPrikupljeno.toLocaleString()} RSD</p>
        </div>
        <div className="bg-[#13141a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Ukupni cilj</p>
          <p className="text-white text-2xl font-bold">{ukupniCilj.toLocaleString()} RSD</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {grupe.length === 0 && <p className="text-slate-500">Nema aktivnih grupa.</p>}
        {grupe.map(g => {
          const procenat = Math.min((parseFloat(g.trenutnoPrikupljeno) / parseFloat(g.ciljIznos)) * 100, 100)
          return (
            <div key={g.id} className="bg-[#13141a] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">{g.naziv}</p>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">{procenat.toFixed(0)}%</span>
                  <button onClick={() => { setSelectedGrupa(g); setShowUplataModal(true) }}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-lg transition">
                    Uplati
                  </button>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full mb-2">
                <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${procenat}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">{parseFloat(g.trenutnoPrikupljeno || 0).toLocaleString()} / {parseFloat(g.ciljIznos).toLocaleString()} RSD</span>
                <div className="flex items-center gap-1">
                  <Users size={13} className="text-slate-500" />
                  <span className="text-slate-500 text-xs">{g.clanovi?.length || 0} članova</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#13141a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-4">Nova grupa</h2>
            <form onSubmit={handleKreiraj} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Naziv grupe</label>
                <input type="text" value={form.naziv} onChange={e => setForm({ ...form, naziv: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Ciljni iznos (RSD)</label>
                <input type="number" value={form.ciljIznos} onChange={e => setForm({ ...form, ciljIznos: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">ID-evi članova (razdvojeni zarezom, opciono)</label>
                <input type="text" value={form.clanovi} onChange={e => setForm({ ...form, clanovi: e.target.value })}
                  placeholder="2, 3, 5" className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg hover:bg-white/10 transition">Otkaži</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition">Kreiraj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUplataModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#13141a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-1">Uplata udela</h2>
            <p className="text-slate-400 text-sm mb-4">{selectedGrupa?.naziv}</p>
            <form onSubmit={handleUplata} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Iznos (RSD)</label>
                <input type="number" value={uplataForm.iznosUdela} onChange={e => setUplataForm({ ...uplataForm, iznosUdela: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Datum uplate</label>
                <input type="date" value={uplataForm.datumUplate} onChange={e => setUplataForm({ ...uplataForm, datumUplate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500" required />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowUplataModal(false)} className="flex-1 bg-white/5 text-slate-300 py-3 rounded-lg hover:bg-white/10 transition">Otkaži</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition">Uplati</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}