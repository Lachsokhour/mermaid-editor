import { useState } from 'react'
import { X, Copy, RotateCcw, Trash2, Clock } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { copyToClipboard, showToast } from '../utils/export'

export function ShareModal({ open, onClose }) {
  const { currentCode, activeDiagram } = useEditorStore()

  if (!open) return null

  const params = new URLSearchParams()
  if (currentCode) params.set('code', currentCode)
  if (activeDiagram) params.set('type', activeDiagram.id)
  const presetUrl = window.location.origin + window.location.pathname + '?' + params.toString()
  const markdownLink = activeDiagram
    ? `[${activeDiagram.label} Diagram](${presetUrl})`
    : `[Mermaid Diagram](${presetUrl})`

  const copy = (text, msg) => {
    copyToClipboard(text)
    showToast(msg || 'Copied!', 'success')
  }

  const handleCopyCode = () => {
    const code = currentCode
    copy(code, 'Code copied!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Share Diagram</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Preset Link</label>
            <div className="flex gap-2">
              <input readOnly value={presetUrl} className="flex-1 px-2 py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono truncate" />
              <button onClick={() => copy(presetUrl)} className="px-2 py-1.5 text-xs rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer">
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Markdown Link</label>
            <div className="flex gap-2">
              <input readOnly value={markdownLink} className="flex-1 px-2 py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono truncate" />
              <button onClick={() => copy(markdownLink, 'Markdown link copied!')} className="px-2 py-1.5 text-xs rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer">
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <button
              onClick={handleCopyCode}
              className="w-full text-xs py-1.5 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Copy Diagram Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HistoryModal({ open, onClose }) {
  const { history, restoreFromHistory, clearHistory } = useEditorStore()

  if (!open) return null

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-5 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Clock size={14} /> Version History
          </h2>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button onClick={clearHistory} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 cursor-pointer" title="Clear history">
                <Trash2 size={13} />
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {history.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-8">No history yet. Changes are auto-saved.</p>
          ) : (
            [...history].reverse().map((entry, i) => (
              <div
                key={entry.ts}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {entry.code?.split('\n')[0]?.substring(0, 60) || '(empty)'}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{formatDate(entry.ts)}</p>
                </div>
                <button
                  onClick={() => { restoreFromHistory(entry); onClose() }}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                  title="Restore"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
