import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { mermaidLanguage } from './mermaidLanguage'
import { mermaidHighlightField } from './mermaidHighlight'
import { formatMermaid } from './formatMermaid'

const mermaidColorSpec = {
  '.cm-mermaid-keyword': { color: '#6366f1', fontWeight: '600' },
  '.cm-mermaid-comment': { color: '#a1a1aa', fontStyle: 'italic' },
  '.cm-mermaid-string': { color: '#10b981' },
  '.cm-mermaid-number': { color: '#f59e0b' },
  '.cm-mermaid-diagramType': { color: '#06b6d4', fontWeight: '600' },
  '.cm-mermaid-arrow': { color: '#f43f5e' },
  '.cm-mermaid-bracket': { color: '#a1a1aa' },
  '.cm-mermaid-label': { color: '#f97316' },
  '.cm-mermaid-directive': { color: '#8b5cf6' },
  '.cm-mermaid-plain': { color: 'inherit' },
}

const DARK_THEME = EditorView.theme({
  '&': {
    backgroundColor: '#09090b',
    color: '#e4e4e7',
    height: '100%',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: '"Google Sans", "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  '.cm-content': {
    caretColor: '#6366f1',
    padding: '16px',
  },
  '.cm-cursor': {
    borderLeftColor: '#6366f1',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#1e1b4b40 !important',
  },
  '.cm-activeLine': {
    backgroundColor: '#18181b',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-line': {
    padding: '0',
  },
  ...mermaidColorSpec,
})

const LIGHT_THEME = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#27272a',
    height: '100%',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: '"Google Sans", "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  '.cm-content': {
    caretColor: '#6366f1',
    padding: '16px',
  },
  '.cm-cursor': {
    borderLeftColor: '#6366f1',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#eef2ff !important',
  },
  '.cm-activeLine': {
    backgroundColor: '#f4f4f5',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-line': {
    padding: '0',
  },
  ...mermaidColorSpec,
})

export function useCodeMirror({ containerRef, value, onChange, onRender, onSave, theme }) {
  const viewRef = useRef(null)
  const themeCompartment = useRef(new Compartment())

  useEffect(() => {
    if (!containerRef.current) return

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChange(update.state.doc.toString())
      }
    })

    const customKeymap = keymap.of([
      {
        key: 'Ctrl-Enter',
        run() {
          onRender()
          return true
        },
      },
      {
        key: 'Mod-s',
        run() {
          onSave()
          return true
        },
      },
    ])

    const state = EditorState.create({
      doc: value,
      extensions: [
        mermaidLanguage(),
        mermaidHighlightField,
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        customKeymap,
        updateListener,
        EditorView.lineWrapping,
        themeCompartment.current.of(theme === 'dark' ? DARK_THEME : LIGHT_THEME),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  // Sync external value changes into editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  // Sync theme changes
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: themeCompartment.current.reconfigure(
        theme === 'dark' ? DARK_THEME : LIGHT_THEME
      ),
    })
  }, [theme])

  const format = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    const formatted = formatMermaid(view.state.doc.toString())
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
    })
  }, [])

  return { format }
}
