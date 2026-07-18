import { Copy, Image, Download, Moon, Sun, Grid3x3, FileCode, Eye, EyeOff } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { copyToClipboard, downloadSVG, downloadPNG, downloadRaw, copyImage, showToast } from '../utils/export'
import { useI18n } from '../i18n/I18nProvider'
import { version as mermaidVersion } from 'mermaid/package.json'

export default function BottomBar() {
  const { currentCode, currentTheme, toggleTheme, gridVisible, toggleGrid, zoom, viewMode, toggleViewMode } = useEditorStore()
  const { t } = useI18n()

  const handleCopyMarkdown = () => {
    const md = '```mermaid\n' + currentCode + '\n```'
    copyToClipboard(md)
    showToast(t('toast.markdownCopied'), 'success')
  }

  const handleCopyLink = () => {
    const params = new URLSearchParams()
    if (currentCode) params.set('code', currentCode)
    const url = window.location.origin + window.location.pathname + '?' + params.toString()
    copyToClipboard(url)
    showToast(t('toast.linkCopied'), 'success')
  }

  if (viewMode) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer"
        >
          <EyeOff size={13} /> {t('common.exitViewMode')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer"
            title={t('common.toggleTheme')}
          >
            {currentTheme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button
            onClick={toggleGrid}
            className={`p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${gridVisible ? 'text-indigo-500' : 'text-zinc-400'}`}
            title={t('common.toggleGrid')}
          >
            <Grid3x3 size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Copy size={12} /> <span className="hidden sm:inline">{t('common.copyMarkdown')}</span>
        </button>
        <button
          onClick={copyImage}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Image size={12} /> <span className="hidden sm:inline">{t('common.copyImage')}</span>
        </button>
        <button
          onClick={downloadSVG}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Download size={12} /> <span className="hidden sm:inline">{t('common.svg')}</span>
        </button>
        <button
          onClick={downloadRaw}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <FileCode size={12} /> <span className="hidden sm:inline">{t('common.raw')}</span>
        </button>
        <button
          onClick={downloadPNG}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Download size={12} /> <span className="hidden sm:inline">{t('common.png')}</span>
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Copy size={12} /> <span className="hidden sm:inline">{t('common.link')}</span>
        </button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title={t('common.viewMode')}
        >
          <Eye size={12} /> <span className="hidden sm:inline">{t('common.viewMode')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          Mermaid v{mermaidVersion}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {Math.round(zoom * 100)}%
        </span>
        <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {t('common.ctrlEnterRender')}
        </kbd>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer"
          title={t('common.toggleTheme')}
        >
          {currentTheme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          onClick={toggleGrid}
          className={`p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${
            gridVisible ? 'text-indigo-500' : 'text-zinc-400'
          }`}
          title={t('common.toggleGrid')}
        >
          <Grid3x3 size={13} />
        </button>
      </div>
    </div>
  )
}
