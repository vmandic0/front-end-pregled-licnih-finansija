import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminAnalitika() {
  const [analitika, setAnalitika] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/analitika')
        setAnalitika(res.data)
      } catch {}
    }
    fetch()
  }, [])

  const mesecniData = analitika?.transakcije_po_mesecu
    ? analitika.transakcije_po_mesecu.slice(0, 6).map(item => ({
        name: `${item.mesec}/${item.godina}`,
        Iznos: parseFloat(item.ukupno) || 0
      }))
    : []

  const katData = analitika?.transakcije_po_kategoriji
    ? analitika.transakcije_po_kategoriji.slice(0, 8).map(item => ({
        name: item.kategorija?.naziv || 'N/A',
        Iznos: parseFloat(item.ukupno) || 0
      }))
    : []

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-6">Analitika</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
          <p className="text-white font-medium mb-4">Transakcije po mesecima</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mesecniData}>
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="Iznos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
          <p className="text-white font-medium mb-4">Transakcije po kategorijama</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={katData} layout="vertical">
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="Iznos" fill="#a78bfa" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}