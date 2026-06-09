import { useState, useRef, useEffect, useCallback } from 'react'
import { Minus, Plus, Maximize, Minimize, Expand } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useI18n } from '../i18n/I18nProvider'
import ColorPalette from './ColorPalette'
import mermaid from 'mermaid'
import { setRawSvg } from '../utils/export'

function initMermaid(currentTheme, themeColors, locale) {
  const isDark = currentTheme === 'dark'
  const font = locale === 'kh'
    ? '"Kantumruy Pro", "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '"Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  mermaid.mermaidAPI?.globalReset?.()
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    maxTextSize: 50000,
    securityLevel: 'loose',
    fontFamily: font,
    themeVariables: {
      darkMode: isDark,
      background: isDark ? '#1a1b1e' : '#ffffff',
      primaryColor: themeColors.primaryColor,
      secondaryColor: themeColors.secondaryColor,
      lineColor: themeColors.lineColor,
      primaryBorderColor: themeColors.primaryBorderColor,
      primaryTextColor: themeColors.primaryTextColor,
    },
  })
}

function patchSvgColors(svg, _themeColors, _currentTheme) {
  return svg
}

export default function Preview() {
  const { currentCode, currentTheme, gridVisible, zoom, panX, panY, themeColors, setZoom, setPan, resetView } = useEditorStore()
  const { t, locale } = useI18n()
  const containerRef = useRef(null)
  const [rendered, setRendered] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const renderIdRef = useRef(0)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const panRef = useRef({ x: panX, y: panY })
  const zoomRef = useRef(zoom)
  const previewRef = useRef(null)
  const initialRenderRef = useRef(true)
  const renderTimerRef = useRef(null)

  // Keep refs in sync with store
  useEffect(() => {
    panRef.current = { x: panX, y: panY }
  }, [panX, panY])
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  // Debounced render diagram
  useEffect(() => {
    const code = currentCode?.trim()
    if (!code) { setRendered(''); setError(null); return }

    setLoading(true)
    setError(null)
    clearTimeout(renderTimerRef.current)
    renderTimerRef.current = setTimeout(() => {
      const id = ++renderIdRef.current

      initMermaid(currentTheme, themeColors, locale)

      const container = document.getElementById('mermaid-container')
      if (container) container.innerHTML = ''

      mermaid.render('mermaid-render-' + id, code).then(({ svg }) => {
        if (id !== renderIdRef.current) return
        setRawSvg(svg)
        const patched = patchSvgColors(svg, themeColors, currentTheme)
        setRendered(patched)
        setLoading(false)
      }).catch(err => {
        if (id !== renderIdRef.current) return
        setError(err.message || t('common.syntaxError'))
        setLoading(false)
      })
    }, 150)

    return () => clearTimeout(renderTimerRef.current)
  }, [currentCode, currentTheme, themeColors])

  // Insert SVG into container
  useEffect(() => {
    const container = document.getElementById('mermaid-container')
    if (!container) return
    if (rendered) {
      container.innerHTML = rendered
      if (initialRenderRef.current) {
        initialRenderRef.current = false
        resetView()
      }
    } else {
      container.innerHTML = ''
    }
  }, [rendered, resetView])

  // Apply transform on zoom change or initial render
  useEffect(() => {
    const container = document.getElementById('mermaid-container')
    if (!container) return
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`
  }, [zoom, panX, panY])

  // Zoom on wheel (non-passive to allow preventDefault)
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const handler = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      zoomRef.current = Math.max(0.2, Math.min(4, zoomRef.current + delta))
      const container = document.getElementById('mermaid-container')
      if (container) {
        container.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`
      }
      setZoom(zoomRef.current)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [setZoom])

  // Pan on drag
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.color-palette')) return
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    if (previewRef.current) previewRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    panRef.current.x += dx
    panRef.current.y += dy
    const container = document.getElementById('mermaid-container')
    if (container) {
      container.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    if (previewRef.current) previewRef.current.style.cursor = zoomRef.current > 1.05 || zoomRef.current < 0.95 ? 'grab' : ''
    setPan(panRef.current.x, panRef.current.y)
  }, [setPan])

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.getElementById('previewPanel')?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) setFullscreen(false)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  // Listen for render event from Editor (Ctrl+Enter)
  useEffect(() => {
    const handler = () => {
      const code = currentCode?.trim()
      if (!code) return
      const id = ++renderIdRef.current
      setLoading(true)
      setError(null)
      initMermaid(currentTheme, themeColors, locale)
      mermaid.render('mermaid-render-' + id, code).then(({ svg }) => {
        if (id !== renderIdRef.current) return
        setRawSvg(svg)
        const patched = patchSvgColors(svg, themeColors, currentTheme)
        setRendered(patched)
        setLoading(false)
      }).catch(err => {
        if (id !== renderIdRef.current) return
      setError(err.message || t('common.syntaxError'))
        setLoading(false)
      })
    }
    window.addEventListener('render', handler)
    return () => window.removeEventListener('render', handler)
  }, [currentCode, currentTheme, themeColors])

  return (
    <div id="previewPanel" className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('common.preview')}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => {
            zoomRef.current = Math.max(0.2, zoomRef.current - 0.1)
            const c = document.getElementById('mermaid-container')
            if (c) c.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`
            setZoom(zoomRef.current)
          }} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer" title={t('common.zoomOut')}>
            <Minus size={12} />
          </button>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => {
            zoomRef.current = Math.min(4, zoomRef.current + 0.1)
            const c = document.getElementById('mermaid-container')
            if (c) c.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`
            setZoom(zoomRef.current)
          }} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer" title={t('common.zoomIn')}>
            <Plus size={12} />
          </button>
          <button onClick={() => {
            panRef.current = { x: 0, y: 0 }
            zoomRef.current = 1
            const c = document.getElementById('mermaid-container')
            if (c) c.style.transform = 'translate(0px, 0px) scale(1)'
            resetView()
          }} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer" title={t('common.resetView')}>
            <Expand size={12} />
          </button>
          <ColorPalette />
          <button onClick={toggleFullscreen} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer" title={fullscreen ? t('common.exitFullscreen') : t('common.fullScreen')}>
            {fullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div
        ref={previewRef}
        className={`flex-1 flex items-center justify-center p-6 overflow-hidden relative ${
          gridVisible ? 'preview-grid' : ''
        } cursor-grab`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 z-10">
            <div className="loading-spinner" />
          </div>
        )}

        <div
          id="mermaid-container"
          ref={containerRef}
          className="origin-center"
        />

        {error && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          </div>
        )}

        {!currentCode?.trim() && !loading && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{t('common.enterCode')}</span>
        )}
      </div>
    </div>
  )
}
