import { create } from 'zustand'
import DIAGRAMS, { TYPE_DETECTORS, DEFAULT_THEME_COLORS, DEFAULT_CONFIG } from '../data/diagrams'

const LS_KEY = 'mermaid-editor-state'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

function saveToStorage(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      code: state.currentCode,
      config: state.configText,
      theme: state.currentTheme,
      grid: state.gridVisible,
      history: state.history.slice(-30),
      activeDiagramId: state.activeDiagram?.id,
      editorWidth: state.editorPanelWidth,
      themeColors: state.themeColors,
    }))
  } catch {}
}

const stored = loadFromStorage()

export const useEditorStore = create((set, get) => ({
  // State
  activeDiagram: stored?.activeDiagramId
    ? DIAGRAMS.find(d => d.id === stored.activeDiagramId) || DIAGRAMS[0]
    : DIAGRAMS[0],
  currentCode: stored?.code ?? DIAGRAMS[0].code,
  configText: stored?.config ?? DEFAULT_CONFIG,
  currentTheme: stored?.theme ?? 'light',
  gridVisible: stored?.grid ?? true,
  zoom: 1,
  panX: 0,
  panY: 0,
  editorPanelWidth: stored?.editorWidth ?? null,
  history: stored?.history ?? [],
  historyIndex: -1,
  themeColors: stored?.themeColors ?? { ...DEFAULT_THEME_COLORS },
  toasts: [],
  sidebarOpen: true,
  paletteOpen: false,

  // Actions
  setActiveDiagram: (diagram) => set({ activeDiagram: diagram, paletteOpen: false }),

  setCurrentCode: (code) => {
    const state = get()
    const history = [...state.history, { code: state.currentCode, ts: Date.now() }]
    set({ currentCode: code, history })
    saveToStorage(get())
  },

  setConfigText: (text) => {
    set({ configText: text })
    saveToStorage(get())
  },

  toggleTheme: () => {
    const next = get().currentTheme === 'light' ? 'dark' : 'light'
    set({ currentTheme: next })
    saveToStorage(get())
  },

  toggleGrid: () => {
    const next = !get().gridVisible
    set({ gridVisible: next })
    saveToStorage(get())
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  togglePalette: () => set(s => ({ paletteOpen: !s.paletteOpen })),
  setPaletteOpen: (open) => set({ paletteOpen: open }),

  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(4, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  setEditorPanelWidth: (width) => {
    set({ editorPanelWidth: width })
    saveToStorage(get())
  },

  setThemeColors: (colors) => {
    set({ themeColors: { ...get().themeColors, ...colors } })
    saveToStorage(get())
  },

  resetThemeColors: () => {
    set({ themeColors: { ...DEFAULT_THEME_COLORS } })
    saveToStorage(get())
  },

  applyPreset: (colors) => {
    set({ themeColors: { ...colors } })
    saveToStorage(get())
  },

  addToast: (message, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3000)
  },

  selectDiagram: (id, silent = false) => {
    const d = DIAGRAMS.find(x => x.id === id)
    if (!d) return
    set({
      activeDiagram: d,
      currentCode: silent ? get().currentCode : d.code,
      paletteOpen: false,
    })
    if (!silent) {
      const history = [...get().history, { code: get().currentCode, ts: Date.now() }]
      set({ history })
    }
    saveToStorage(get())
  },

  detectType: (code) => {
    for (const detector of TYPE_DETECTORS) {
      if (detector.regex.test(code)) {
        const d = DIAGRAMS.find(x => x.id === detector.id)
        if (d) {
          const state = get()
          if (state.activeDiagram?.id !== d.id) {
            set({ activeDiagram: d })
          }
          return d
        }
      }
    }
    return null
  },

  restoreFromHistory: (entry) => {
    set({ currentCode: entry.code })
    saveToStorage(get())
  },

  clearHistory: () => {
    set({ history: [], historyIndex: -1 })
    saveToStorage(get())
  },
}))
