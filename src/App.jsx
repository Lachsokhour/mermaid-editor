import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import Toolbar from './components/Toolbar'
import BottomBar from './components/BottomBar'
import Toast from './components/Toast'
import { ShareModal, HistoryModal } from './components/Modal'
import { useEditorStore } from './store/editorStore'
import { I18nProvider } from './i18n/I18nProvider'

import { preloadExportFonts } from './utils/export'

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

function AppContent() {
  const { currentTheme, toggleSidebar, sidebarOpen, viewMode, editorPanelWidth, setEditorPanelWidth } = useEditorStore()
  const [shareOpen, setShareOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Theme class on root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')
  }, [currentTheme])

  // Preload fonts for diagram rendering and export
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 1em "Rubik"'),
      document.fonts.load('500 1em "Rubik"'),
      document.fonts.load('600 1em "Rubik"'),
      document.fonts.load('700 1em "Rubik"'),
      document.fonts.load('400 1em "Kantumruy Pro"'),
      document.fonts.load('500 1em "Kantumruy Pro"'),
      document.fonts.load('600 1em "Kantumruy Pro"'),
      document.fonts.load('700 1em "Kantumruy Pro"'),
      document.fonts.load('400 1em "Google Sans"'),
      preloadExportFonts(),
    ]).catch(() => {})
  }, [])

  // Load URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const type = params.get('type')
    if (code) {
      useEditorStore.getState().setCurrentCode(code)
    }
    if (type) {
      useEditorStore.getState().selectDiagram(type, true)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        useEditorStore.getState().toggleTheme()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toggleSidebar])

  // Resize handler (mouse + touch)
  const handleResizeStart = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX ?? e.touches?.[0]?.clientX
    const editor = document.getElementById('editorPanel')
    const parent = editor?.parentElement
    if (!editor || !parent || startX == null) return
    const startWidth = editor.offsetWidth

    const getX = (e) => e.clientX ?? e.touches?.[0]?.clientX ?? 0

    const onMove = (e) => {
      const diff = getX(e) - startX
      const total = parent.offsetWidth
      const w = Math.max(total * 0.2, Math.min(total * 0.8, startWidth + diff))
      editor.style.flex = 'none'
      editor.style.width = w + 'px'
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
      const w = editor.offsetWidth
      setEditorPanelWidth(w)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onUp)
  }, [setEditorPanelWidth])

  // Restore editor width from storage
  const editorStyle = editorPanelWidth
    ? { flex: 'none', width: editorPanelWidth + 'px' }
    : { flex: '0 0 35%' }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
      <Toolbar
        onShare={() => setShareOpen(true)}
        onHistory={() => setHistoryOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {!viewMode && <Sidebar />}
        {!viewMode && (
          <div id="editorPanel" className="flex flex-col border-r border-zinc-200 dark:border-zinc-700 min-w-0" style={editorStyle}>
            <Editor />
          </div>
        )}
        {!viewMode && (
          <div
            className="resize-handle"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          />
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <Preview />
        </div>
      </div>

      <BottomBar />
      <Toast />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
