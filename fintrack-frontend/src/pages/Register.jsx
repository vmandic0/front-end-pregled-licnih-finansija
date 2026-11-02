import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Check, Star } from 'lucide-react'
import Footer from '../components/Footer'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!termsAccepted) {
      setError('Morate pročitati i prihvatiti Uslove korišćenja i Politiku privatnosti.')
      return
    }
    if (!ageConfirmed) {
      setError('Morate potvrditi da imate najmanje 16 godina.')
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Lozinke se ne poklapaju.')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation, true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri registraciji.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
    <div className="flex-1 flex">
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
          {['Prihodi i troškovi na jednom mestu', 'Mesečni pregled finansija', 'PDF izveštaji'].map(f => (
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
            <label htmlFor="terms-accepted" className="flex items-start gap-3 text-slate-400 text-sm cursor-pointer">
              <input
                id="terms-accepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-amber-500"
                required
              />
              <span>
                Pročitao/la sam i prihvatam{' '}
                <Link
                  to="/uslovi-koriscenja"
                  className="text-amber-500 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  Uslove korišćenja i Politiku privatnosti
                </Link>
                .
              </span>
            </label>
            <label htmlFor="age-confirmed" className="flex items-start gap-3 text-slate-400 text-sm cursor-pointer">
              <input
                id="age-confirmed"
                type="checkbox"
                checked={ageConfirmed}
                onChange={e => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-amber-500"
                required
              />
              <span>Potvrđujem da imam najmanje 16 godina.</span>
            </label>
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
      <Footer />
    </div>
  )
}