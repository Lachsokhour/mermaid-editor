import { useState, useEffect, useRef, useCallback } from 'react'
import { Code2, Settings, Book, AlertTriangle, Workflow } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { showToast } from '../utils/export'
import { useI18n } from '../i18n/I18nProvider'

const TABS = [
  { id: 'code', icon: Code2 },
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
        </div>
      )}
    </div>
  )
}
