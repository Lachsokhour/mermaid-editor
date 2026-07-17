import { useState } from 'react'
import { ChevronDown, ChevronRight, Paintbrush, ArrowRight, Layers } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

function Section({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
      >
        {Icon && <Icon size={13} className="text-indigo-500 shrink-0" />}
        <span className="flex-1">{title}</span>
        {open ? <ChevronDown size={12} className="text-zinc-400" /> : <ChevronRight size={12} className="text-zinc-400" />}
      </button>
      {open && <div className="px-3 pb-3 text-xs text-zinc-600 dark:text-zinc-400 space-y-2 border-t border-zinc-100 dark:border-zinc-800">{children}</div>}
    </div>
  )
}

function Code({ children }) {
  return (
    <pre className="px-2 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre">
      {children}
    </pre>
  )
}

function PropTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="text-left py-1 pr-2 font-medium text-zinc-500 dark:text-zinc-400">Property</th>
            <th className="text-left py-1 pr-2 font-medium text-zinc-500 dark:text-zinc-400">Example</th>
            <th className="text-left py-1 font-medium text-zinc-500 dark:text-zinc-400">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([prop, ex, desc]) => (
            <tr key={prop} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1 pr-2 font-mono text-indigo-600 dark:text-indigo-400">{prop}</td>
              <td className="py-1 pr-2 font-mono text-zinc-500 dark:text-zinc-500">{ex}</td>
              <td className="py-1 text-zinc-500 dark:text-zinc-500">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const NODE_PROPS = [
  ['fill', '#3b82f6', 'Background color'],
  ['stroke', '#1e40af', 'Border color'],
  ['stroke-width', '2px', 'Border thickness'],
  ['color', '#ffffff', 'Text color'],
  ['font-size', '14px', 'Text size'],
  ['font-weight', 'bold', 'Text weight'],
  ['font-style', 'italic', 'Text style'],
  ['rx', '8', 'Corner roundness H'],
  ['ry', '8', 'Corner roundness V'],
  ['opacity', '0.8', 'Transparency 0-1'],
]

const EDGE_PROPS = [
  ['stroke', '#3b82f6', 'Line color'],
  ['stroke-width', '2px', 'Line thickness'],
  ['stroke-dasharray', '8 4', 'Dash pattern'],
  ['color', '#1e293b', 'Label text color'],
  ['fill', '#ffffff', 'Label background'],
  ['opacity', '0.5', 'Transparency 0-1'],
]

const DASH_PATTERNS = [
  ['Solid', '(empty)', '─────────'],
  ['Dashed', '8 4', '──── ────'],
  ['Short', '5 5', '─── ───'],
  ['Dotted', '3 3', '─ ─ ─ ─'],
  ['Tiny', '2 2', '─ ─ ─ ─ tight'],
  ['Dash-dot', '8 4 2 4', '──── ─·──'],
]

export default function StylingGuide() {
  const { t } = useI18n()

  return (
    <div className="space-y-3">
      {/* Node Styling */}
      <Section title={t('stylingGuide.nodeTitle')} icon={Paintbrush} defaultOpen={true}>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-2">{t('stylingGuide.nodeIntro')}</p>

        <div className="space-y-1.5 pt-1">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.inlineStyle')}</p>
          <Code>{'style <nodeId> fill:#color,stroke:#color,color:#text'}</Code>
          <PropTable rows={NODE_PROPS} />
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.classDefStyle')}</p>
          <Code>{`classDef success fill:#22c55e,stroke:#16a34a,color:#fff\nclass A,B success`}</Code>
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.nodeExample')}</p>
          <Code>{`graph TD
  A[Start] --> B[Process] --> C[End]

  style A fill:#22c55e,stroke:#16a34a,color:#fff
  style B fill:#3b82f6,stroke:#1d4ed8,color:#fff
  style C fill:#ef4444,stroke:#dc2626,color:#fff`}</Code>
        </div>
      </Section>

      {/* Edge Styling */}
      <Section title={t('stylingGuide.edgeTitle')} icon={ArrowRight}>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-2">{t('stylingGuide.edgeIntro')}</p>

        <div className="space-y-1.5 pt-1">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.edgeSyntax')}</p>
          <Code>{'linkStyle <edgeIndex> stroke:#color,stroke-width:2px'}</Code>
          <PropTable rows={EDGE_PROPS} />
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.edgeIndexTitle')}</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{t('stylingGuide.edgeIndexDesc')}</p>
          <Code>{`graph TD\n  A --> B --> C --> D --> E\n\n  %% Index: 0=A→B, 1=B→C, 2=C→D, 3=D→E`}</Code>
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.dashPatterns')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-1 pr-2 font-medium text-zinc-500 dark:text-zinc-400">{t('stylingGuide.patternName')}</th>
                  <th className="text-left py-1 pr-2 font-medium text-zinc-500 dark:text-zinc-400">{t('stylingGuide.patternValue')}</th>
                  <th className="text-left py-1 font-medium text-zinc-500 dark:text-zinc-400">{t('stylingGuide.patternVisual')}</th>
                </tr>
              </thead>
              <tbody>
                {DASH_PATTERNS.map(([name, val, vis]) => (
                  <tr key={name} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-1 pr-2 font-medium text-zinc-600 dark:text-zinc-400">{name}</td>
                    <td className="py-1 pr-2 font-mono text-indigo-600 dark:text-indigo-400">{val}</td>
                    <td className="py-1 font-mono text-zinc-500 dark:text-zinc-500">{vis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.edgeExample')}</p>
          <Code>{`graph TD
  A[User] -->|Login| B[Auth]
  B -->|OK| C[Dashboard]
  B -->|Fail| D[Error]

  linkStyle 0 stroke:#22c55e,stroke-width:2px
  linkStyle 1 stroke:#22c55e,stroke-width:2px
  linkStyle 2 stroke:#ef4444,stroke-width:2px,stroke-dasharray: 5 5`}</Code>
        </div>
      </Section>

      {/* Global CSS */}
      <Section title={t('stylingGuide.cssTitle')} icon={Layers}>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-2">{t('stylingGuide.cssIntro')}</p>

        <div className="space-y-1.5 pt-1">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.cssNodeExample')}</p>
          <Code>{`.node rect {
  fill: #f0f9ff;
  stroke: #3b82f6;
  stroke-width: 2px;
  rx: 8;
}

.node circle {
  fill: #ede9fe;
  stroke: #8b5cf6;
}

.node text {
  font-size: 12px;
  font-weight: bold;
}`}</Code>
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('stylingGuide.cssEdgeExample')}</p>
          <Code>{`.edgePath .path {
  stroke: #6366f1;
  stroke-width: 2px;
}

.edgeLabel {
  background-color: #f8fafc;
  font-size: 11px;
}`}</Code>
        </div>
      </Section>
    </div>
  )
}
