import { History, Share2, Sparkles, PanelLeftClose, PanelLeft, Languages } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useI18n } from '../i18n/I18nProvider'

export default function Toolbar({ onShare, onHistory }) {
  const { sidebarOpen, toggleSidebar, activeDiagram, currentCode } = useEditorStore()
  const { t, locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer"
        title={t('common.toggleSidebar')}
      >
        {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
      </button>

      <div className="flex items-center gap-1 ml-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline">
          {t('diagrams.' + (activeDiagram?.id || '')) || t('common.noDiagram')}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => setLocale(locale === 'kh' ? 'en' : 'kh')}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title={t('common.language')}
        >
          <Languages size={13} />
          <span className="hidden sm:inline">{locale === 'kh' ? 'KH' : 'EN'}</span>
        </button>
        <button
          onClick={onHistory}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title={t('common.versionHistory')}
        >
          <History size={13} />
          <span className="hidden sm:inline">{t('common.history')}</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title={t('common.share')}
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">{t('common.share')}</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
          title={t('common.editWithAI')}
        >
          <Sparkles size={13} />
          <span className="hidden sm:inline">{t('common.editWithAI')}</span>
        </button>
      </div>
    </div>
  )
}
