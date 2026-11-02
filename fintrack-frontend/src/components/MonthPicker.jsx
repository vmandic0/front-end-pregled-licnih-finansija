import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '../utils/date'

function shiftMonth(month, offset) {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getMonthOptions(oldestMonth, currentMonth) {
  const options = []
  for (let month = oldestMonth; month <= currentMonth; month = shiftMonth(month, 1)) {
    options.push(month)
  }
  return options
}

export default function MonthPicker({ value, onChange, oldestMonth }) {
  const currentMonth = getCurrentMonth()
  const firstMonth = oldestMonth || shiftMonth(currentMonth, -23)
  const months = getMonthOptions(firstMonth, currentMonth)
  const selectedMonth = months.includes(value) ? value : currentMonth
  const selectedIndex = months.indexOf(selectedMonth)
  const isCurrentMonth = selectedMonth === currentMonth

  const selectMonth = month => onChange(month)

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => selectMonth(months[selectedIndex - 1])}
        disabled={selectedIndex <= 0}
        aria-label="Prethodni mesec"
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft size={16} />
      </button>
      <select
        value={selectedMonth}
        onChange={e => selectMonth(e.target.value)}
        aria-label="Izaberite mesec"
        className="bg-[var(--bg-card)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-500"
      >
        {months.map(month => <option key={month} value={month}>{formatMonth(month)}</option>)}
      </select>
      <button
        type="button"
        onClick={() => selectMonth(months[selectedIndex + 1])}
        disabled={isCurrentMonth}
        aria-label="Sledeći mesec"
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight size={16} />
      </button>
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() => selectMonth(currentMonth)}
          className="text-amber-400 hover:text-amber-300 text-xs whitespace-nowrap px-2 py-1"
        >
          Tekući mesec
        </button>
      )}
    </div>
  )
}
