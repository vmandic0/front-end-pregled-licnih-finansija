import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Check, Star } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError('Lozinke se ne poklapaju.')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri registraciji.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Leva strana */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 border-r border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-white">F</span>
        </div>
        <h1 className="text-white text-4xl font-bold mb-3">FinTrack</h1>
        <p className="text-slate-400 text-center max-w-sm mb-10">
          Kreirajte besplatan nalog i počnite da pratite vaše finansije danas.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {['Besplatan basic nalog', 'Neograničene transakcije', 'Kategorizacija troškova'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <Check size={16} className="text-green-400" />
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Star size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm">Premium — net worth, krediti, izveštaji</span>
          </div>
        </div>
      </div>

      {/* Desna strana */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-white text-3xl font-bold mb-1">Kreirajte nalog</h2>
          <p className="text-slate-400 mb-8">Brza i besplatna registracija</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Ime i prezime</label>
              <input
                type="text"
                placeholder="Vaše ime"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500 transition placeholder:text-slate-600"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Email adresa</label>
              <input
                type="email"
                placeholder="korisnik@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500 transition placeholder:text-slate-600"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Lozinka</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500 transition placeholder:text-slate-600"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Potvrda lozinke</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-amber-500 transition placeholder:text-slate-600"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Registracija...' : 'Registruj se'}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Već imate nalog?{' '}
            <Link to="/login" className="text-amber-500 hover:underline">Prijavite se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}