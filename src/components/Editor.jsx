import { useState, useEffect, useRef, useCallback } from 'react'
import { Code2, Settings, Book, AlertTriangle, Workflow, Paintbrush } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { showToast } from '../utils/export'
import { useI18n } from '../i18n/I18nProvider'
import { parseClassDefs, parseClassAssignments, parseInlineStyles, parseLinkStyles, styleObjectToString, parseStyleString, DEFAULT_CLASS_STYLE } from '../utils/styleParser'
import StylingGuide from './StylingGuide'

const TABS = [
  { id: 'code', icon: Code2 },
  { id: 'style', icon: Paintbrush },
  { id: 'config', icon: Settings },
  { id: 'docs', icon: Book },
]

const DOCS_URLS = {
  flowchart: 'https://mermaid.js.org/syntax/flowchart.html',
  sequence: 'https://mermaid.js.org/syntax/sequenceDiagram.html',
  class: 'https://mermaid.js.org/syntax/classDiagram.html',
  'entity-relationship': 'https://mermaid.js.org/syntax/entityRelationshipDiagram.html',
  state: 'https://mermaid.js.org/syntax/stateDiagram.html',
  object: 'https://mermaid.js.org/syntax/objectDiagram.html',
  gantt: 'https://mermaid.js.org/syntax/gantt.html',
  kanban: 'https://mermaid.js.org/syntax/kanban.html',
  timeline: 'https://mermaid.js.org/syntax/timeline.html',
  'user-journey': 'https://mermaid.js.org/syntax/userJourney.html',
  requirement: 'https://mermaid.js.org/syntax/requirementDiagram.html',
  mindmap: 'https://mermaid.js.org/syntax/mindmap.html',
  architecture: 'https://mermaid.js.org/syntax/architecture.html',
  block: 'https://mermaid.js.org/syntax/block.html',
  c4: 'https://mermaid.js.org/syntax/c4.html',
  git: 'https://mermaid.js.org/syntax/gitgraph.html',
  ishikawa: 'https://mermaid.js.org/syntax/ishikawa.html',
  packet: 'https://mermaid.js.org/syntax/packet.html',
  pie: 'https://mermaid.js.org/syntax/pie.html',
  quadrant: 'https://mermaid.js.org/syntax/quadrantChart.html',
  radar: 'https://mermaid.js.org/syntax/xyChart.html',
  sankey: 'https://mermaid.js.org/syntax/sankey.html',
  treeview: 'https://mermaid.js.org/syntax/mindmap.html',
  treemap: 'https://mermaid.js.org/syntax/mindmap.html',
  venn: 'https://mermaid.js.org/syntax/flowchart.html',
  wardley: 'https://mermaid.js.org/syntax/quadrantChart.html',
}

export default function Editor() {
  const { currentCode, setCurrentCode, configText, setConfigText, activeDiagram, detectType } = useEditorStore()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('code')
  const [diagramLabel, setDiagramLabel] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    setDiagramLabel(t('diagrams.' + (activeDiagram?.id || '')))
  }, [activeDiagram, t])

  const handleCodeChange = useCallback((e) => {
    const code = e.target.value
    setCurrentCode(code)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      detectType(code)
    }, 300)
  }, [setCurrentCode, detectType])

  const handleConfigChange = useCallback((e) => {
    setConfigText(e.target.value)
  }, [setConfigText])

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('render'))
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      showToast(t('common.saved'), 'success')
    }
  }, [t])

  const editorLabel = t('diagrams.' + (activeDiagram?.id || '')) || diagramLabel

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon size={13} />
              {t('editor.tab.' + tab.id)}
            </button>
          )
        })}
        {editorLabel && (
          <span className="ml-auto px-3 py-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Workflow size={11} />
            {editorLabel}
          </span>
        )}
      </div>

      {/* Code Tab */}
      {activeTab === 'code' && (
        <textarea
          value={currentCode}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full p-4 text-sm leading-relaxed font-mono bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-none outline-none resize-none tab-size-2"
          spellCheck={false}
          placeholder={t('editor.placeholder')}
        />
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <textarea
          value={configText}
          onChange={handleConfigChange}
          className="flex-1 w-full p-4 text-sm leading-relaxed font-mono bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-none outline-none resize-none"
          spellCheck={false}
        />
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <StyleTab />
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <div className="flex-1 p-6 overflow-y-auto text-sm text-zinc-600 dark:text-zinc-400 space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={14} />
            <span className="font-medium">{t('common.gettingStarted')}</span>
          </div>
          <p>{t('common.introLine1')}</p>
          <p dangerouslySetInnerHTML={{
            __html: t('common.introLine2').replace(
              /Ctrl\+Enter|Ctrl\+S/g,
              m => `<kbd class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono">${m}</kbd>`
            )
          }} />

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('common.documentation')}</p>
            {activeDiagram && DOCS_URLS[activeDiagram.id] ? (
              <a
                href={DOCS_URLS[activeDiagram.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
              >
                {t('editor.viewGuide', { label: t('diagrams.' + activeDiagram.id) })} &rarr;
              </a>
            ) : (
              <a
                href="https://mermaid.js.org/syntax/flowchart.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
              >
                {t('editor.viewMermaidDocs')} &rarr;
              </a>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('common.keyboardShortcuts')}</p>
            <div className="space-y-1 text-xs">
              {[
                ['Ctrl+Enter', 'common.renderDiagram'],
                ['Ctrl+S', 'common.saveState'],
                ['Ctrl+B', 'common.toggleSidebar'],
                ['Ctrl+Shift+D', 'common.toggleTheme'],
              ].map(([key, descKey]) => (
                <div key={key} className="flex justify-between">
                  <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px]">{key}</kbd>
                  <span className="text-zinc-400">{t(descKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <StylingGuide />
          </div>
        </div>
      )}
    </div>
  )
}

function StyleTab() {
  const { currentCode, updateClassDef, removeClassDef, removeElementStyle, removeLinkStyle, updateLinkStyle, getCapabilities } = useEditorStore()
  const { t } = useI18n()
  const classDefs = parseClassDefs(currentCode)
  const classAssignments = parseClassAssignments(currentCode)
  const inlineStyles = parseInlineStyles(currentCode)
  const linkStyles = parseLinkStyles(currentCode)
  const caps = getCapabilities()

  const [newClassName, setNewClassName] = useState('')
  const [newClassStyle, setNewClassStyle] = useState(DEFAULT_CLASS_STYLE)

  const [edgeIndex, setEdgeIndex] = useState('0')
  const [edgeStroke, setEdgeStroke] = useState('#94a3b8')
  const [edgeWidth, setEdgeWidth] = useState('2px')
  const [edgeDash, setEdgeDash] = useState('')

  const handleAddClassDef = () => {
    if (!newClassName.trim()) return
    const styles = parseStyleString(newClassStyle)
    updateClassDef(newClassName.trim(), styles)
    setNewClassName('')
    setNewClassStyle(DEFAULT_CLASS_STYLE)
  }

  const handleAddEdgeStyle = () => {
    const idx = parseInt(edgeIndex)
    if (isNaN(idx) || idx < 0) return
    const styles = { stroke: edgeStroke }
    if (edgeWidth && edgeWidth !== '2px') styles['stroke-width'] = edgeWidth
    if (edgeDash) styles['stroke-dasharray'] = edgeDash
    updateLinkStyle(idx, styles)
    setEdgeIndex(String(idx + 1))
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Class Definitions */}
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
          Class Definitions ({Object.keys(classDefs).length})
        </h3>
        {Object.entries(classDefs).length === 0 ? (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">No classDef found. Create one below.</p>
        ) : (
          <div className="space-y-1">
            {Object.entries(classDefs).map(([name, styles]) => (
              <div key={name} className="flex items-center gap-2 p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 group">
                <div
                  className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 shrink-0"
                  style={{ backgroundColor: styles.fill || 'transparent' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 font-mono truncate">{name}</div>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                    {styleObjectToString(styles)}
                  </div>
                </div>
                <button
                  onClick={() => removeClassDef(name)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex gap-1.5">
          <input
            type="text"
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            placeholder="class name"
            className="w-1/3 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
          />
          <input
            type="text"
            value={newClassStyle}
            onChange={e => setNewClassStyle(e.target.value)}
            placeholder="fill:#fff,stroke:#333"
            className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleAddClassDef}
            className="px-2 py-1 text-[10px] rounded bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Class Assignments */}
      {Object.keys(classAssignments).length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Class Assignments
          </h3>
          <div className="space-y-1">
            {Object.entries(classAssignments).map(([nodeId, className]) => (
              <div key={nodeId} className="flex items-center gap-2 p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 text-[10px]">
                <span className="font-mono text-zinc-600 dark:text-zinc-400">{nodeId}</span>
                <span className="text-zinc-400">→</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{className}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Styles */}
      {Object.keys(inlineStyles).length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Inline Styles
          </h3>
          <div className="space-y-1">
            {Object.entries(inlineStyles).map(([nodeId, styles]) => (
              <div key={nodeId} className="flex items-center gap-2 p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 group">
                <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 flex-1 truncate">{nodeId}</span>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 truncate flex-1">
                  {styleObjectToString(styles)}
                </span>
                <button
                  onClick={() => removeElementStyle(nodeId)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edge Styles */}
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
          {t('styleEditor.edge')} {t('common.styles')} ({Object.keys(linkStyles).length})
        </h3>

        {/* Existing edge styles */}
        {Object.keys(linkStyles).length > 0 && (
          <div className="space-y-1 mb-2">
            {Object.entries(linkStyles).map(([index, styles]) => (
              <div key={index} className="flex items-center gap-2 p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 group">
                <svg width="20" height="8" viewBox="0 0 20 8" className="shrink-0">
                  <line
                    x1="0" y1="4" x2="20" y2="4"
                    stroke={styles.stroke || '#94a3b8'}
                    strokeWidth={styles['stroke-width'] || '2'}
                    strokeDasharray={styles['stroke-dasharray'] || 'none'}
                  />
                </svg>
                <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">edge {index}</span>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 truncate flex-1">
                  {styleObjectToString(styles)}
                </span>
                <button
                  onClick={() => removeLinkStyle(parseInt(index))}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add edge style */}
        {caps.edgeStyle && (
          <div className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 w-8">#</label>
              <input
                type="number"
                min="0"
                value={edgeIndex}
                onChange={e => setEdgeIndex(e.target.value)}
                className="w-12 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
              />
              <input
                type="color"
                value={edgeStroke}
                onChange={e => setEdgeStroke(e.target.value)}
                className="w-7 h-7 p-0.5 border border-zinc-300 dark:border-zinc-600 rounded cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={edgeStroke}
                onChange={e => setEdgeStroke(e.target.value)}
                placeholder="#94a3b8"
                className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 w-8">W</label>
              {['1px', '2px', '3px', '4px'].map(w => (
                <button
                  key={w}
                  onClick={() => setEdgeWidth(w)}
                  className={`flex-1 text-[8px] py-1 rounded cursor-pointer transition-colors ${
                    edgeWidth === w
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 w-8">---</label>
              {[
                { label: '—', value: '' },
                { label: '- -', value: '8 4' },
                { label: '· ·', value: '3 3' },
                { label: '-·-', value: '8 4 2 4' },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setEdgeDash(value)}
                  className={`flex-1 text-[8px] py-1 rounded cursor-pointer transition-colors ${
                    edgeDash === value
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddEdgeStyle}
              className="w-full px-2 py-1.5 text-[10px] rounded bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
            >
              + {t('common.line')} {t('common.style')}
            </button>
          </div>
        )}
        {!caps.edgeStyle && Object.keys(linkStyles).length === 0 && (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{t('styleEditor.edgeNotSupported')}</p>
        )}
      </div>

      {/* Quick help */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
          Use <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[9px]">classDef name fill:#color</kbd> to define reusable styles.
          Apply with <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[9px]">class NodeId name</kbd> or <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[9px]">Node:::name</kbd>.
          Use <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[9px]">style Node fill:#color</kbd> for one-off styles.
        </p>
      </div>
    </div>
  )
}
