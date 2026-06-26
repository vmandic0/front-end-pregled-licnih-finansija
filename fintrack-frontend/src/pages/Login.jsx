import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.type === 'administrator') navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      setError('Pogrešan email ili lozinka.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Leva strana */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 border-r border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-white">F</span>
        </div>
        <h1 className="text-white text-4xl font-bold mb-3">FinTrack</h1>
        <p className="text-slate-400 text-center max-w-sm mb-10">
          Preuzmi kontrolu nad svojim finansijama. Prati prihode, troškove i ciljeve na jednom mestu.
        </p>
        <div className="flex gap-10 text-center">
          <div>
            <p className="text-white text-2xl font-bold">160+</p>
            <p className="text-slate-500 text-sm">Valuta</p>
          </div>
          <div>
            <p className="text-white text-2xl font-bold">3</p>
            <p className="text-slate-500 text-sm">Korisničke uloge</p>
          </div>
          <div>
            <p className="text-white text-2xl font-bold">PDF</p>
            <p className="text-slate-500 text-sm">Izvoz izveštaja</p>
          </div>
        </div>
      </div>

      {/* Desna strana */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-white text-3xl font-bold mb-1">Dobrodošli nazad</h2>
          <p className="text-slate-400 mb-8">Prijavite se na vaš nalog</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="text-right mt-1">
                <Link to="/zaboravljena-lozinka" className="text-amber-500 text-sm hover:underline">
                  Zaboravili ste lozinku?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Prijava...' : 'Prijavi se'}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Nemate nalog?{' '}
            <Link to="/register" className="text-amber-500 hover:underline">Registrujte se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}