import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminKorisnici() {
  const [korisnici, setKorisnici] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchKorisnici() }, [])

  const fetchKorisnici = async () => {
    try {
      const res = await api.get('/admin/korisnici')
      setKorisnici(res.data.data || res.data)
    } catch {}
  }

  const handlePromeniUlogu = async (id, type) => {
    await api.put(`/admin/korisnici/${id}/uloge`, { type })
    fetchKorisnici()
  }

  const handlePromeniPremium = async (id, isPremium) => {
    await api.put(`/admin/korisnici/${id}/premium`, { isPremium })
    fetchKorisnici()
  }

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Korisnici</h1>
      <div className="bg-[#13141a] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">KORISNIK</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">EMAIL</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">TIP</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">STATUS</th>
              <th className="text-left text-slate-500 text-xs font-medium px-4 py-3">AKCIJE</th>
            </tr>
          </thead>
          <tbody>
            {korisnici.map(k => (
              <tr key={k.id} className="border-b border-white/5 hover:bg-white/2 transition">
                <td className="px-4 py-3 text-white text-sm">{k.name}</td>
                <td className="px-4 py-3 text-slate-400 text-sm">{k.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${k.type === 'administrator' ? 'bg-purple-500/10 text-purple-400' : k.klijent?.premium_klijent ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                    {k.type === 'administrator' ? 'Admin' : k.klijent?.premium_klijent ? 'Premium' : 'Basic'}
                  </span>
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Aktivan</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {k.type !== 'administrator' && (
                      <>
                        {k.klijent && (
                          <button onClick={() => handlePromeniPremium(k.id, !k.klijent.premium_klijent)}
                            className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2 py-1 rounded transition">
                            {k.klijent.premium_klijent ? 'Skini Premium' : 'Dodaj Premium'}
                          </button>
                        )}
                        <button onClick={() => handlePromeniUlogu(k.id, 'administrator')}
                          className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 rounded transition">
                          Postavi Admin
                        </button>
                      </>
                    )}
                    {k.type === 'administrator' && (
                      <button onClick={() => handlePromeniUlogu(k.id, 'klijent')}
                        className="text-xs bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded transition">
                        Ukloni Admin
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}