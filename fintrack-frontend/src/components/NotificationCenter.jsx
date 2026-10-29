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
      const [{ data }, { data: pendingInvitations }] = await Promise.all([
        api.get('/obavestenja'),
        api.get('/grupni-pozivi'),
      ])
      const items = data.data || data
      const invitationNotifications = pendingInvitations.map(invitation => ({
        id: `group-invitation-${invitation.id}`,
        read_at: null,
        data: {
          event_key: `group-invitation:${invitation.id}`,
          title: 'Poziv za grupnu štednju',
          message: `${invitation.pozivalac} vas je pozvao u grupu „${invitation.grupa_naziv}“.`,
          details: {
            type: 'group_invitation',
            invitation_id: invitation.id,
            group_id: invitation.grupa_id,
            group_name: invitation.grupa_naziv,
            inviter_name: invitation.pozivalac,
            actions: true,
          },
        },
      }))
      const existingInvitationIds = new Set(
        items
          .map(item => item.data?.details?.invitation_id)
          .filter(Boolean)
          .map(String),
      )
      const mergedItems = [
        ...items,
        ...invitationNotifications.filter(item => !existingInvitationIds.has(String(item.data.details.invitation_id))),
      ]
      const unread = mergedItems.filter(item => !item.read_at)

      if (showBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
        unread
          .filter(item => !knownIds.current.has(item.id))
          .forEach(item => new Notification(item.data.title, { body: item.data.message }))
      }

      mergedItems.forEach(item => knownIds.current.add(item.id))
      setNotifications(mergedItems)
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

  const answerGroupInvitation = async (invitationId, answer) => {
    try {
      await api.post(`/grupni-pozivi/${invitationId}/${answer}`)
      setSelected(null)
      await loadNotifications()
    } catch (error) {
      console.error('Nije moguće obraditi poziv za grupu.', error)
    }
  }

  const openNotification = async (notification) => {
    const isSyntheticInvitation = String(notification.id).startsWith('group-invitation-')
    if (!notification.read_at && !isSyntheticInvitation) {
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
            {selected.data.details?.type === 'group_invitation' && selected.data.details?.actions && (
              <div className="flex gap-3 mt-5">
                <button onClick={() => answerGroupInvitation(selected.data.details.invitation_id, 'odbij')}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg">
                  Odbij
                </button>
                <button onClick={() => answerGroupInvitation(selected.data.details.invitation_id, 'prihvati')}
                  className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 rounded-lg">
                  Prihvati
                </button>
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
