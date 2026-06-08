import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

const ICONS = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info }
const COLORS = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const { message, type = 'info' } = e.detail
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <div className="fixed bottom-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || Info
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shadow-lg animate-in slide-in-from-right ${COLORS[t.type]}`}
          >
            <Icon size={14} className="shrink-0" />
            <span>{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100">
              <X size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
