import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 px-4 md:px-6 py-4 mt-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-center">
      <p>© {new Date().getFullYear()} Vuk Mandić i Tamara Simić. Sva prava zadržana.</p>
      <Link to="/uslovi-koriscenja" className="hover:text-amber-500 transition">
        Uslovi korišćenja
      </Link>
    </footer>
  )
}
