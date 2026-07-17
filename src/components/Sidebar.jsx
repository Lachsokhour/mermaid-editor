import { useState } from 'react'
import DIAGRAMS from '../data/diagrams'
import { useEditorStore } from '../store/editorStore'
import * as LucideIcons from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

export default function Sidebar() {
  const { activeDiagram, sidebarOpen, selectDiagram } = useEditorStore()
  const { t } = useI18n()
  const [search, setSearch] = useState('')

  const handleSelect = (id) => {
    selectDiagram(id)
  }

  const q = search.toLowerCase()
  const filtered = DIAGRAMS.filter(d =>
    t('diagrams.' + d.id).toLowerCase().includes(q) || d.id.includes(q)
  )

  return (
    <div
      className={`border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col transition-all duration-200 overflow-hidden shrink-0 ${
        sidebarOpen ? 'w-56' : 'w-0'
      }`}
    >
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-full px-2 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-[10px] text-zinc-400 text-center py-4">No diagrams match</p>
        )}
        {filtered.map(d => {
          const Icon = LucideIcons[d.icon]
          const isActive = activeDiagram?.id === d.id
          return (
            <button
              key={d.id}
              onClick={() => handleSelect(d.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {Icon && <Icon size={14} className="shrink-0" />}
              <span className="truncate flex-1">{t('diagrams.' + d.id)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
