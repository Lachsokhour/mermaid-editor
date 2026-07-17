import { useState, useRef, useEffect, useCallback } from 'react'
import { Minus, Plus, Maximize, Minimize, Expand } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useI18n } from '../i18n/I18nProvider'
import ColorPalette from './ColorPalette'
import StylePanel from './StylePanel'
import StyleEditor from './StyleEditor'
import ClassManager from './ClassManager'
import ThemeCSSEditor from './ThemeCSSEditor'
import mermaid from 'mermaid'
import { setRawSvg } from '../utils/export'
import { addClickHandlers, clearHighlights, highlightElement, CLICK_SELECTORS } from '../utils/svgInspector'
import { extractEdgeIndex } from '../utils/styleParser'
import { migrateMermaidCode } from '../utils/migrateMermaid'

function initMermaid(currentTheme, themeColors, themeCSS) {
  const isDark = currentTheme === 'dark'
  const fontFamily = '"Kantumruy Pro", "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const fontCss = `foreignObject div, foreignObject span, foreignObject p { font-family: ${fontFamily} !important; }\n`
  mermaid.mermaidAPI?.globalReset?.()
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    maxTextSize: 50000,
    securityLevel: 'loose',
    fontFamily,
    themeCSS: fontCss + (themeCSS || ''),
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


export default function Preview() {
  const { currentCode, currentTheme, gridVisible, zoom, panX, panY, themeColors, themeCSS, selectedElement, selectElement, clearSelection, setZoom, setPan, resetView } = useEditorStore()
  const { t } = useI18n()
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

  useEffect(() => {
    panRef.current = { x: panX, y: panY }
  }, [panX, panY])
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    const code = currentCode?.trim()
    if (!code) { setRendered(''); setError(null); return }

    setLoading(true)
    setError(null)
    clearTimeout(renderTimerRef.current)
    renderTimerRef.current = setTimeout(() => {
      const id = ++renderIdRef.current

      initMermaid(currentTheme, themeColors, themeCSS)

      const container = document.getElementById('mermaid-container')
      if (container) container.innerHTML = ''

      const safeCode = migrateMermaidCode(code)
      mermaid.render('mermaid-render-' + id, safeCode).then(({ svg }) => {
        if (id !== renderIdRef.current) return
        setRawSvg(svg)
        setRendered(svg)
        setLoading(false)
      }).catch(err => {
        if (id !== renderIdRef.current) return
        setError(err.message || t('common.syntaxError'))
        setLoading(false)
      })
    }, 150)

    return () => clearTimeout(renderTimerRef.current)
  }, [currentCode, currentTheme, themeColors, themeCSS])

  useEffect(() => {
    const container = document.getElementById('mermaid-container')
    if (!container) return
    if (rendered) {
      container.innerHTML = rendered
      if (initialRenderRef.current) {
        initialRenderRef.current = false
        resetView()
      }
      addClickHandlers(container, (element) => {
        const enriched = { ...element }
        if (element.type === 'edge') {
          const edgeMatch = element.dataId?.match(/^L-(\w+)-(\w+)-(\d+)$/)
          if (edgeMatch) {
            enriched.fromId = edgeMatch[1]
            enriched.toId = edgeMatch[2]
            const idx = extractEdgeIndex(currentCode, edgeMatch[1], edgeMatch[2])
            enriched.edgeIndex = idx >= 0 ? idx : (element.edgeOrderIndex >= 0 ? element.edgeOrderIndex : -1)
          } else {
            const genericMatch = element.dataId?.match(/([\w]+)-([\w]+)-(\d+)$/)
            if (genericMatch && genericMatch[1] !== 'edge' && genericMatch[1] !== 'L') {
              enriched.fromId = genericMatch[1]
              enriched.toId = genericMatch[2]
              const idx = extractEdgeIndex(currentCode, genericMatch[1], genericMatch[2])
              enriched.edgeIndex = idx >= 0 ? idx : (element.edgeOrderIndex >= 0 ? element.edgeOrderIndex : -1)
            } else if (element.edgeOrderIndex >= 0) {
              enriched.edgeIndex = element.edgeOrderIndex
            }
          }
        }
        selectElement(enriched)
        highlightElement(container, element.id)
      })
    } else {
      container.innerHTML = ''
    }
  }, [rendered, resetView, selectElement, currentCode])

  useEffect(() => {
    const container = document.getElementById('mermaid-container')
    if (!container) return
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`
  }, [zoom, panX, panY])

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const handler = (e) => {
      if (e.target.closest('.style-editor, .color-palette, .style-panel, [class*="preset"]')) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      zoomRef.current = Math.max(0.2, Math.min(10, zoomRef.current + delta))
      const container = document.getElementById('mermaid-container')
      if (container) {
        container.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`
      }
      setZoom(zoomRef.current)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [setZoom])

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.color-palette') || e.target.closest('.style-editor')) return
    if (!e.target.closest(CLICK_SELECTORS)) {
      clearSelection()
      const container = document.getElementById('mermaid-container')
      clearHighlights(container)
    }
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    if (previewRef.current) previewRef.current.style.cursor = 'grabbing'
  }, [clearSelection])

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

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        clearSelection()
        const container = document.getElementById('mermaid-container')
        clearHighlights(container)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [clearSelection])

  useEffect(() => {
    const handler = () => {
      const code = currentCode?.trim()
      if (!code) return
      const id = ++renderIdRef.current
      setLoading(true)
      setError(null)
      initMermaid(currentTheme, themeColors, themeCSS)
      const safeCode = migrateMermaidCode(code)
      mermaid.render('mermaid-render-' + id, safeCode).then(({ svg }) => {
        if (id !== renderIdRef.current) return
        setRawSvg(svg)
        setRendered(svg)
        setLoading(false)
      }).catch(err => {
        if (id !== renderIdRef.current) return
        setError(err.message || t('common.syntaxError'))
        setLoading(false)
      })
    }
    window.addEventListener('render', handler)
    return () => window.removeEventListener('render', handler)
  }, [currentCode, currentTheme, themeColors, themeCSS])

  return (
    <div id="previewPanel" className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('common.preview')}</span>
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end">
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
            zoomRef.current = Math.min(10, zoomRef.current + 0.1)
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
        className={`flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative ${
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
          <div className="absolute bottom-12 left-3 right-3 z-10">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          </div>
        )}

        {!currentCode?.trim() && !loading && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{t('common.enterCode')}</span>
        )}

        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
          <ThemeCSSEditor />
          <ClassManager />
          <StylePanel />
        </div>

        {selectedElement && (
          <div className="absolute top-3 right-3 z-20">
            <StyleEditor />
          </div>
        )}
      </div>
    </div>
  )
}
