import { create } from 'zustand'
import DIAGRAMS, { TYPE_DETECTORS, DEFAULT_THEME_COLORS, DEFAULT_COLORS_BY_TYPE, DIAGRAM_CAPABILITIES } from '../data/diagrams'
import { generatePalette, getDefaultPaletteParams, hexToHsl } from '../utils/palette'
import { applyStyleToCode, removeStyleFromCode, applyClassDefToCode, removeClassDef, applyClassAssignmentToCode, removeClassAssignment, applyLinkStyle, removeLinkStyle } from '../utils/styleParser'

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
      theme: state.currentTheme,
      grid: state.gridVisible,
      history: state.history.slice(-30),
      activeDiagramId: state.activeDiagram?.id,
      editorWidth: state.editorPanelWidth,
      diagramThemeColors: state.diagramThemeColors,
      diagramPaletteParams: state.diagramPaletteParams,
      themeCSS: state.themeCSS,
    }))
  } catch {}
}

const stored = loadFromStorage()

function getDefaultColorsFor(id) {
  return { ...(DEFAULT_COLORS_BY_TYPE[id] || DEFAULT_THEME_COLORS) }
}

let initialDiagramColors
if (stored?.diagramThemeColors) {
  initialDiagramColors = { ...stored.diagramThemeColors }
  DIAGRAMS.forEach(d => {
    if (!initialDiagramColors[d.id]) {
      initialDiagramColors[d.id] = getDefaultColorsFor(d.id)
    }
  })
} else if (stored?.themeColors) {
  initialDiagramColors = {}
  DIAGRAMS.forEach(d => {
    initialDiagramColors[d.id] = { ...stored.themeColors }
  })
} else {
  initialDiagramColors = {}
  DIAGRAMS.forEach(d => {
    initialDiagramColors[d.id] = getDefaultColorsFor(d.id)
  })
}

const initialActiveId = stored?.activeDiagramId
  ? (DIAGRAMS.find(d => d.id === stored.activeDiagramId) || DIAGRAMS[0]).id
  : DIAGRAMS[0].id

function getPaletteFor(state, diagramId) {
  if (state.diagramPaletteParams[diagramId]) {
    return state.diagramPaletteParams[diagramId]
  }
  const colors = state.diagramThemeColors?.[diagramId] || getDefaultColorsFor(diagramId)
  const hsl = hexToHsl(colors.primaryColor)
  return { ...getDefaultPaletteParams(), h: Math.round(hsl.h) }
}

const initialPaletteParams = (() => {
  const saved = stored?.diagramPaletteParams?.[initialActiveId]
  if (saved) return saved
  const colors = initialDiagramColors[initialActiveId] || getDefaultColorsFor(initialActiveId)
  const hsl = hexToHsl(colors.primaryColor)
  return { ...getDefaultPaletteParams(), h: Math.round(hsl.h) }
})()

export const useEditorStore = create((set, get) => ({
  activeDiagram: stored?.activeDiagramId
    ? DIAGRAMS.find(d => d.id === stored.activeDiagramId) || DIAGRAMS[0]
    : DIAGRAMS[0],
  currentCode: stored?.code ?? DIAGRAMS[0].code,
  currentTheme: stored?.theme ?? 'light',
  gridVisible: stored?.grid ?? true,
  zoom: 1,
  panX: 0,
  panY: 0,
  editorPanelWidth: stored?.editorWidth ?? null,
  history: stored?.history ?? [],
  historyIndex: -1,
  diagramThemeColors: initialDiagramColors,
  themeColors: initialDiagramColors[initialActiveId] || getDefaultColorsFor(initialActiveId),
  diagramPaletteParams: stored?.diagramPaletteParams ?? {},
  paletteParams: initialPaletteParams,
  toasts: [],
  sidebarOpen: true,
  paletteOpen: false,
  selectedElement: null,
  styleEditorOpen: false,
  themeCSS: stored?.themeCSS ?? '',

  // --- Navigation ---
  setActiveDiagram: (diagram) => set(s => {
    const colors = s.diagramThemeColors[diagram.id] || getDefaultColorsFor(diagram.id)
    const params = getPaletteFor(s, diagram.id)
    return { activeDiagram: diagram, themeColors: colors, paletteParams: params, paletteOpen: false }
  }),

  setCurrentCode: (code) => {
    const state = get()
    const history = [...state.history, { code: state.currentCode, ts: Date.now() }]
    set({ currentCode: code, history })
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

  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(10, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  setEditorPanelWidth: (width) => {
    set({ editorPanelWidth: width })
    saveToStorage(get())
  },

  // --- Theme colors ---
  setThemeColors: (colors) => {
    const state = get()
    const id = state.activeDiagram?.id
    if (!id) return
    const current = state.diagramThemeColors[id] || getDefaultColorsFor(id)
    const merged = { ...current, ...colors }
    set({
      diagramThemeColors: { ...state.diagramThemeColors, [id]: merged },
      themeColors: merged,
    })
    saveToStorage(get())
  },

  resetThemeColors: () => {
    const state = get()
    const id = state.activeDiagram?.id
    if (!id) return
    const defaults = getDefaultColorsFor(id)
    set({
      diagramThemeColors: { ...state.diagramThemeColors, [id]: defaults },
      themeColors: defaults,
    })
    saveToStorage(get())
  },

  applyPreset: (colors) => {
    const state = get()
    const id = state.activeDiagram?.id
    if (!id) return
    set({
      diagramThemeColors: { ...state.diagramThemeColors, [id]: { ...colors } },
      themeColors: { ...colors },
    })
    saveToStorage(get())
  },

  setPaletteParams: (params) => {
    const state = get()
    const id = state.activeDiagram?.id
    if (!id) return
    const merged = { ...getPaletteFor(state, id), ...params }
    const generated = generatePalette(merged.h, merged.s, merged.l, merged.harmony, merged)
    set({
      diagramPaletteParams: { ...state.diagramPaletteParams, [id]: merged },
      paletteParams: merged,
      diagramThemeColors: { ...state.diagramThemeColors, [id]: generated },
      themeColors: generated,
    })
    saveToStorage(get())
  },

  selectDiagram: (id, silent = false) => {
    const d = DIAGRAMS.find(x => x.id === id)
    if (!d) return
    const state = get()
    const diagramColors = state.diagramThemeColors[id] || getDefaultColorsFor(id)
    const params = getPaletteFor(state, id)
    set({
      activeDiagram: d,
      themeColors: diagramColors,
      paletteParams: params,
      currentCode: silent ? state.currentCode : d.code,
      paletteOpen: false,
    })
    if (!silent) {
      const history = [...state.history, { code: state.currentCode, ts: Date.now() }]
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
            const diagramColors = state.diagramThemeColors[d.id] || getDefaultColorsFor(d.id)
            const params = getPaletteFor(state, d.id)
            set({ activeDiagram: d, themeColors: diagramColors, paletteParams: params })
          }
          return d
        }
      }
    }
    return null
  },

  addToast: (message, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3000)
  },

  restoreFromHistory: (entry) => {
    set({ currentCode: entry.code })
    saveToStorage(get())
  },

  clearHistory: () => {
    set({ history: [], historyIndex: -1 })
    saveToStorage(get())
  },

  // --- Element selection ---
  selectElement: (element) => {
    set({ selectedElement: element, styleEditorOpen: element !== null })
  },

  clearSelection: () => {
    set({ selectedElement: null })
  },

  toggleStyleEditor: () => set(s => ({ styleEditorOpen: !s.styleEditorOpen })),
  setStyleEditorOpen: (open) => set({ styleEditorOpen: open }),

  getCapabilities: () => {
    const state = get()
    const id = state.activeDiagram?.id
    return DIAGRAM_CAPABILITIES[id] || { nodeStyle: false, edgeStyle: false, classDef: false, clusters: false }
  },

  setThemeCSS: (css) => {
    set({ themeCSS: css })
    saveToStorage(get())
  },

  // --- Internal: code mutation with history ---
  _mutateCode: (mutator) => {
    const state = get()
    const prevCode = state.currentCode
    const newCode = mutator(prevCode)
    if (newCode === prevCode) return
    const history = [...state.history, { code: prevCode, ts: Date.now() }]
    set({ currentCode: newCode, history })
    saveToStorage(get())
  },

  // --- Element style actions (with history) ---
  updateElementStyle: (nodeId, styleObj) => {
    get()._mutateCode(code => applyStyleToCode(code, nodeId, styleObj))
  },

  removeElementStyle: (nodeId) => {
    get()._mutateCode(code => removeStyleFromCode(code, nodeId))
  },

  applyPresetToElement: (nodeId, presetStyles) => {
    get()._mutateCode(code => applyStyleToCode(code, nodeId, presetStyles))
  },

  applyPresetToElements: (nodeIds, presetStyles) => {
    get()._mutateCode(code => {
      let result = code
      for (const nodeId of nodeIds) {
        result = applyStyleToCode(result, nodeId, presetStyles)
      }
      return result
    })
  },

  // --- ClassDef actions (with history) ---
  updateClassDef: (className, styleObj) => {
    get()._mutateCode(code => applyClassDefToCode(code, className, styleObj))
  },

  removeClassDef: (className) => {
    get()._mutateCode(code => removeClassDef(code, className))
  },

  assignClassToNodes: (nodeIds, className) => {
    get()._mutateCode(code => applyClassAssignmentToCode(code, nodeIds, className))
  },

  removeClassAssignment: (nodeId) => {
    get()._mutateCode(code => removeClassAssignment(code, nodeId))
  },

  // --- Edge/Link style actions (with history) ---
  updateLinkStyle: (edgeIndex, styleObj) => {
    get()._mutateCode(code => applyLinkStyle(code, edgeIndex, styleObj))
  },

  removeLinkStyle: (edgeIndex) => {
    get()._mutateCode(code => removeLinkStyle(code, edgeIndex))
  },
}))
