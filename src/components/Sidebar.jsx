import DIAGRAMS, { DEFAULT_COLORS_BY_TYPE } from '../data/diagrams'
import { useEditorStore } from '../store/editorStore'
import * as LucideIcons from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

export default function Sidebar() {
  const { activeDiagram, sidebarOpen, selectDiagram, diagramThemeColors } = useEditorStore()
  const { t } = useI18n()

  const handleSelect = (id) => {
    selectDiagram(id)
  }

  const hasCustomColor = (id) => {
    const saved = diagramThemeColors[id]
    if (!saved) return false
    const defaults = DEFAULT_COLORS_BY_TYPE[id]
    if (!defaults) return false
    return saved.primaryColor !== defaults.primaryColor
  }

  return (
    <div
      className={`border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col transition-all duration-200 overflow-hidden shrink-0 ${
        sidebarOpen ? 'w-56' : 'w-0'
      }`}
    >
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
        <input
          type="text"
          placeholder={t('common.search')}
          className="w-full px-2 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {DIAGRAMS.map(d => {
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
              {hasCustomColor(d.id) && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: diagramThemeColors[d.id]?.primaryColor || '#6366f1' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
