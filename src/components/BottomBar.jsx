import { Copy, Image, Download, Moon, Sun, Grid3x3 } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { copyToClipboard, downloadSVG, downloadPNG, copyImage, showToast } from '../utils/export'

export default function BottomBar() {
  const { currentCode, currentTheme, toggleTheme, gridVisible, toggleGrid, zoom } = useEditorStore()

  const handleCopyMarkdown = () => {
    const md = '```mermaid\n' + currentCode + '\n```'
    copyToClipboard(md)
    showToast('Markdown copied!', 'success')
  }

  const handleCopyLink = () => {
    const params = new URLSearchParams()
    if (currentCode) params.set('code', currentCode)
    const url = window.location.origin + window.location.pathname + '?' + params.toString()
    copyToClipboard(url)
    showToast('Link copied!', 'success')
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Copy size={12} /> Copy Markdown
        </button>
        <button
          onClick={copyImage}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Image size={12} /> Copy Image
        </button>
        <button
          onClick={downloadSVG}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Download size={12} /> SVG
        </button>
        <button
          onClick={downloadPNG}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Download size={12} /> PNG
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Copy size={12} /> Link
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {Math.round(zoom * 100)}%
        </span>
        <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          Ctrl+Enter render
        </kbd>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer"
          title="Toggle theme"
        >
          {currentTheme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          onClick={toggleGrid}
          className={`p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${
            gridVisible ? 'text-indigo-500' : 'text-zinc-400'
          }`}
          title="Toggle grid"
        >
          <Grid3x3 size={13} />
        </button>
      </div>
    </div>
  )
}
