import { History, Share2, Sparkles, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

export default function Toolbar({ onShare, onHistory }) {
  const { sidebarOpen, toggleSidebar, activeDiagram, currentCode, currentTheme } = useEditorStore()
  const Icon = PanelLeftClose

  const shareUrl = () => {
    const base = window.location.origin + window.location.pathname
    const params = new URLSearchParams()
    if (currentCode) params.set('code', currentCode)
    if (activeDiagram) params.set('type', activeDiagram.id)
    return `${base}?${params.toString()}`
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer"
        title="Toggle sidebar"
      >
        {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
      </button>

      <div className="flex items-center gap-1 ml-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline">
          {activeDiagram?.label || 'Diagram'}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onHistory}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title="Version History"
        >
          <History size={13} />
          <span className="hidden sm:inline">History</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title="Share"
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
          title="Edit with AI"
        >
          <Sparkles size={13} />
          <span className="hidden sm:inline">Edit with AI</span>
        </button>
      </div>
    </div>
  )
}
