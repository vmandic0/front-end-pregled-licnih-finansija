import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import api from '../api/axios'
import { useCurrency } from '../context/CurrencyContext'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const knownIds = useRef(new Set())
  const { formatMoney } = useCurrency()

  const loadNotifications = useCallback(async (showBrowserNotification = false) => {
    try {
      const { data } = await api.get('/obavestenja')
      const items = data.data || data
      const unread = items.filter(item => !item.read_at)

      if (showBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
        unread
          .filter(item => !knownIds.current.has(item.id))
          .forEach(item => new Notification(item.data.title, { body: item.data.message }))
      }

      items.forEach(item => knownIds.current.add(item.id))
      setNotifications(items)
    } catch (error) {
      console.error('Nije moguće učitati obaveštenja.', error)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = window.setInterval(() => loadNotifications(true), 60000)
    return () => window.clearInterval(interval)
  }, [loadNotifications])

  const requestBrowserNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      await api.post(`/obavestenja/${notification.id}/procitano`)
      setNotifications(current => current.map(item => (
        item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
      )))
    }
    setSelected(notification)
    setOpen(false)
  }

  const unreadCount = notifications.filter(notification => !notification.read_at).length

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(value => !value)
          requestBrowserNotifications()
        }}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
        aria-label="Obaveštenja"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-white font-medium">Obaveštenja</p>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="text-slate-500 text-sm p-4">Nema obaveštenja.</p>}
            {notifications.map(notification => (
              <button
                key={notification.id}
                onClick={() => openNotification(notification)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${notification.read_at ? 'opacity-60' : ''}`}
              >
                <p className="text-white text-sm font-medium">{notification.data.title}</p>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{notification.data.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setSelected(null)}>
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-6 w-full max-w-md" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-semibold">{selected.data.title}</h2>
                <p className="text-slate-400 text-sm mt-2">{selected.data.message}</p>
              </div>
              <Check size={18} className="text-green-400 shrink-0" />
            </div>
            {selected.data.details && (
              <div className="mt-4 text-slate-400 text-sm space-y-1">
                {selected.data.details.category && <p>Kategorija: {selected.data.details.category}</p>}
                {selected.data.details.amount && <p>Iznos: {formatMoney(selected.data.details.amount)}</p>}
                {selected.data.details.percentage && <p>Iskorišćenost limita: {selected.data.details.percentage}%</p>}
              </div>
            )}
            <button onClick={() => setSelected(null)} className="mt-5 w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg">
              Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
