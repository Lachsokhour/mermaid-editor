import { useState, useEffect, useCallback } from 'react'
import { X, Paintbrush, Type, Square, ArrowRight, Copy, Trash2 } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { STYLE_PROPS_LIST, styleObjectToString, parseStyleString, getNodeStyles, parseLinkStyles } from '../utils/styleParser'
import { EDGE_STYLE_PRESETS, ELEMENT_STYLE_PRESETS } from '../data/stylePresets'
import { useI18n } from '../i18n/I18nProvider'

const COLOR_PROPS = ['fill', 'stroke', 'color']
const TEXT_PROPS = ['font-size', 'font-weight', 'font-style']
const SHAPE_PROPS = ['rx', 'ry', 'stroke-width', 'stroke-dasharray', 'opacity']
const EDGE_PROPS = ['stroke', 'stroke-width', 'stroke-dasharray', 'opacity', 'fill']

function ShapeIcon({ shape, color, size = 16 }) {
  const s = size
  const c = color || '#6366f1'
  if (shape === 'diamond') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L22 12L12 22L2 12Z" stroke={c} strokeWidth="2" fill={`${c}20`} />
      </svg>
    )
  }
  if (shape === 'circle') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill={`${c}20`} />
      </svg>
    )
  }
  if (shape === 'cylinder') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke={c} strokeWidth="2" fill={`${c}20`} />
        <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke={c} strokeWidth="2" fill="none" />
      </svg>
    )
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={c} strokeWidth="2" fill={`${c}20`} />
    </svg>
  )
}

export default function StyleEditor() {
  const { selectedElement, currentCode, clearSelection, updateElementStyle, removeElementStyle, applyPresetToElement, updateLinkStyle, removeLinkStyle, getCapabilities } = useEditorStore()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('colors')
  const [localStyle, setLocalStyle] = useState({})
  const [presetFilter, setPresetFilter] = useState('all')

  const isEdge = selectedElement?.type === 'edge'
  const isCluster = selectedElement?.type === 'cluster'
  const caps = getCapabilities()
  const canStyleThis = isEdge ? caps.edgeStyle : caps.nodeStyle

  useEffect(() => {
    setActiveTab(isEdge ? 'line' : 'colors')
  }, [isEdge])

  useEffect(() => {
    if (!selectedElement) return
    if (isEdge) {
      const linkStyles = parseLinkStyles(currentCode)
      const edgeIndex = selectedElement.edgeIndex
      setLocalStyle((edgeIndex != null && edgeIndex >= 0) ? (linkStyles[edgeIndex] || {}) : {})
    } else {
      setLocalStyle(getNodeStyles(currentCode, selectedElement.id))
    }
  }, [selectedElement, currentCode, isEdge])

  const handleStyleChange = useCallback((key, value) => {
    if (!selectedElement || !canStyleThis) return
    const updated = { ...localStyle, [key]: value }
    setLocalStyle(updated)
    if (isEdge) {
      if (selectedElement.edgeIndex != null && selectedElement.edgeIndex >= 0) {
        updateLinkStyle(selectedElement.edgeIndex, updated)
      }
    } else {
      updateElementStyle(selectedElement.id, updated)
    }
  }, [selectedElement, localStyle, updateElementStyle, updateLinkStyle, isEdge])

  const handleRemoveStyle = useCallback(() => {
    if (!selectedElement || !canStyleThis) return
    setLocalStyle({})
    if (isEdge) {
      if (selectedElement.edgeIndex != null && selectedElement.edgeIndex >= 0) {
        removeLinkStyle(selectedElement.edgeIndex)
      }
    } else {
      removeElementStyle(selectedElement.id)
    }
  }, [selectedElement, removeElementStyle, removeLinkStyle, isEdge])

  const handleApplyPreset = useCallback((preset) => {
    if (!selectedElement || !canStyleThis) return
    setLocalStyle(preset.styles)
    if (isEdge) {
      if (selectedElement.edgeIndex != null && selectedElement.edgeIndex >= 0) {
        updateLinkStyle(selectedElement.edgeIndex, preset.styles)
      }
    } else {
      applyPresetToElement(selectedElement.id, preset.styles)
    }
  }, [selectedElement, applyPresetToElement, updateLinkStyle, isEdge])

  const handleCopyStyle = useCallback(() => {
    if (!selectedElement || !canStyleThis) return
    const str = styleObjectToString(localStyle)
    if (str) {
      const text = isEdge
        ? `linkStyle ${selectedElement.edgeIndex} ${str}`
        : `style ${selectedElement.id} ${str}`
      navigator.clipboard?.writeText(text)
    }
  }, [selectedElement, localStyle, isEdge])

  if (!selectedElement) return null

  const selectedShape = isEdge ? null : (selectedElement.shape || 'rect')
  const filteredPresets = isEdge
    ? EDGE_STYLE_PRESETS
    : ELEMENT_STYLE_PRESETS.filter(p => {
        if (presetFilter === 'all') return true
        if (presetFilter === selectedShape) return true
        return p.category === presetFilter
      })

  const tabs = isEdge
    ? (caps.edgeStyle
        ? [{ id: 'line', icon: ArrowRight, label: 'Line' }, { id: 'presets', icon: Copy, label: 'Presets' }]
        : [])
    : isCluster
      ? (caps.nodeStyle
          ? [{ id: 'colors', icon: Paintbrush, label: 'Colors' }, { id: 'presets', icon: Copy, label: 'Presets' }]
          : [])
      : (caps.nodeStyle
          ? [
              { id: 'colors', icon: Paintbrush, label: 'Colors' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'shape', icon: Square, label: 'Shape' },
              { id: 'presets', icon: Copy, label: 'Presets' },
            ]
          : [])

  return (
    <div className="style-editor w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isEdge ? 'bg-amber-500' : 'bg-indigo-500'}`} />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
            {isEdge
              ? (selectedElement.fromId && selectedElement.toId
                  ? `${selectedElement.fromId} → ${selectedElement.toId}`
                  : selectedElement.label || `Edge ${selectedElement.edgeIndex ?? '?'}`)
              : (selectedElement.label || selectedElement.id)}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase">
            {isEdge ? 'edge' : isCluster ? 'cluster' : selectedElement.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopyStyle} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 cursor-pointer" title="Copy style">
            <Copy size={11} />
          </button>
          <button onClick={handleRemoveStyle} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 cursor-pointer" title="Remove style">
            <Trash2 size={11} />
          </button>
          <button onClick={clearSelection} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 cursor-pointer">
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Icon size={10} />
              {tab.label}
            </button>
          )
        })}
      </div>
      )}

      {/* Content */}
      <div className="p-3 max-h-[300px] overflow-y-auto">
        {/* Not supported message */}
        {!canStyleThis && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
              {isEdge ? 'Edge styling not supported for this diagram type' : 'Node styling not supported for this diagram type'}
            </div>
            <div className="text-[9px] text-zinc-300 dark:text-zinc-600 mt-1">
              Use Theme CSS for global styling
            </div>
          </div>
        )}

        {/* Edge line properties */}
        {isEdge && activeTab === 'line' && canStyleThis && (
          <div className="space-y-3">
            {/* Edge label display */}
            {selectedElement.label && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">{selectedElement.label}</span>
              </div>
            )}

            {/* Quick color presets */}
            <div>
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mb-1">Quick colors</label>
              <div className="flex gap-1 flex-wrap">
                {[
                  { color: '#3b82f6', name: 'Blue' },
                  { color: '#10b981', name: 'Green' },
                  { color: '#ef4444', name: 'Red' },
                  { color: '#f59e0b', name: 'Amber' },
                  { color: '#8b5cf6', name: 'Violet' },
                  { color: '#6b7280', name: 'Gray' },
                  { color: '#ec4899', name: 'Pink' },
                  { color: '#14b8a6', name: 'Teal' },
                ].map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => handleStyleChange('stroke', color)}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                      localStyle.stroke === color
                        ? 'border-zinc-900 dark:border-white scale-110'
                        : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Stroke color */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">Line</label>
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="color"
                  value={localStyle.stroke || '#94a3b8'}
                  onChange={e => handleStyleChange('stroke', e.target.value)}
                  className="w-7 h-6 p-0.5 border border-zinc-300 dark:border-zinc-600 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={localStyle.stroke || ''}
                  onChange={e => handleStyleChange('stroke', e.target.value)}
                  placeholder="#94a3b8"
                  className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Label text color */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">Label</label>
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="color"
                  value={localStyle.color || '#1e293b'}
                  onChange={e => handleStyleChange('color', e.target.value)}
                  className="w-7 h-6 p-0.5 border border-zinc-300 dark:border-zinc-600 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={localStyle.color || ''}
                  onChange={e => handleStyleChange('color', e.target.value)}
                  placeholder="text color"
                  className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Label background fill */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">Fill</label>
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="color"
                  value={localStyle.fill || '#ffffff'}
                  onChange={e => handleStyleChange('fill', e.target.value)}
                  className="w-7 h-6 p-0.5 border border-zinc-300 dark:border-zinc-600 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={localStyle.fill || ''}
                  onChange={e => handleStyleChange('fill', e.target.value)}
                  placeholder="bg color"
                  className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Stroke width */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">Width</label>
              <div className="flex items-center gap-1 flex-1">
                {['1px', '2px', '3px', '4px'].map(w => (
                  <button
                    key={w}
                    onClick={() => handleStyleChange('stroke-width', w)}
                    className={`flex-1 text-[9px] py-1 rounded cursor-pointer transition-colors ${
                      localStyle['stroke-width'] === w
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke dash */}
            <div>
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mb-1">Pattern</label>
              <div className="grid grid-cols-3 gap-1 mb-1.5">
                {[
                  { label: 'Solid', value: '' },
                  { label: 'Dashed', value: '8 4' },
                  { label: 'Short', value: '5 5' },
                  { label: 'Dotted', value: '3 3' },
                  { label: 'Tiny', value: '2 2' },
                  { label: 'DashDot', value: '8 4 2 4' },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => handleStyleChange('stroke-dasharray', value)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded cursor-pointer transition-colors ${
                      (localStyle['stroke-dasharray'] || '') === value
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-1 ring-indigo-300 dark:ring-indigo-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <svg width="32" height="6" viewBox="0 0 32 6">
                      <line
                        x1="0" y1="3" x2="32" y2="3"
                        stroke={localStyle.stroke || '#94a3b8'}
                        strokeWidth="2"
                        strokeDasharray={value || 'none'}
                      />
                    </svg>
                    <span className="text-[7px] text-zinc-400 dark:text-zinc-500 leading-none">{label}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={localStyle['stroke-dasharray'] || ''}
                onChange={e => handleStyleChange('stroke-dasharray', e.target.value)}
                placeholder="e.g. 5 5, 10 5 2 5"
                className="w-full text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Opacity</label>
                <span className="text-[10px] text-zinc-400 font-mono">{localStyle.opacity || '1'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localStyle.opacity || '1'}
                onChange={e => handleStyleChange('opacity', e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Edge presets */}
        {isEdge && activeTab === 'presets' && canStyleThis && (
          <div className="grid grid-cols-3 gap-1.5">
            {EDGE_STYLE_PRESETS.map(preset => {
              const previewColor = preset.styles.stroke || '#94a3b8'
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                  title={preset.name}
                >
                  <svg width="24" height="12" viewBox="0 0 24 12">
                    <line
                      x1="0" y1="6" x2="24" y2="6"
                      stroke={previewColor}
                      strokeWidth={preset.styles['stroke-width'] || '2'}
                      strokeDasharray={preset.styles['stroke-dasharray'] || 'none'}
                    />
                  </svg>
                  <span className="text-[8px] text-zinc-400 dark:text-zinc-500 leading-none">{preset.name}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Node colors */}
        {!isEdge && activeTab === 'colors' && canStyleThis && (
          <div className="space-y-2">
            {COLOR_PROPS.map(key => {
              const prop = STYLE_PROPS_LIST.find(p => p.key === key)
              if (!prop) return null
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">{prop.label}</label>
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="color"
                      value={localStyle[key] || '#6366f1'}
                      onChange={e => handleStyleChange(key, e.target.value)}
                      className="w-7 h-6 p-0.5 border border-zinc-300 dark:border-zinc-600 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={localStyle[key] || ''}
                      onChange={e => handleStyleChange(key, e.target.value)}
                      placeholder={prop.default || '#000'}
                      className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Node text */}
        {!isEdge && activeTab === 'text' && canStyleThis && (
          <div className="space-y-2">
            {TEXT_PROPS.map(key => {
              const prop = STYLE_PROPS_LIST.find(p => p.key === key)
              if (!prop) return null
              if (prop.type === 'select') {
                return (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">{prop.label}</label>
                    <select
                      value={localStyle[key] || ''}
                      onChange={e => handleStyleChange(key, e.target.value)}
                      className="flex-1 text-[10px] px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none"
                    >
                      {prop.options.map(opt => (
                        <option key={opt} value={opt}>{opt || 'Default'}</option>
                      ))}
                    </select>
                  </div>
                )
              }
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-16">{prop.label}</label>
                  <input
                    type="text"
                    value={localStyle[key] || ''}
                    onChange={e => handleStyleChange(key, e.target.value)}
                    placeholder="e.g. 14px"
                    className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Node shape */}
        {!isEdge && activeTab === 'shape' && canStyleThis && (
          <div className="space-y-2">
            {SHAPE_PROPS.map(key => {
              const prop = STYLE_PROPS_LIST.find(p => p.key === key)
              if (!prop) return null
              if (prop.type === 'range') {
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{prop.label}</label>
                      <span className="text-[10px] text-zinc-400 font-mono">{localStyle[key] || '1'}</span>
                    </div>
                    <input
                      type="range"
                      min={prop.min}
                      max={prop.max}
                      step={prop.step}
                      value={localStyle[key] || prop.max}
                      onChange={e => handleStyleChange(key, e.target.value)}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-indigo-500"
                    />
                  </div>
                )
              }
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium w-20">{prop.label}</label>
                  <input
                    type="text"
                    value={localStyle[key] || ''}
                    onChange={e => handleStyleChange(key, e.target.value)}
                    placeholder={prop.type === 'color' ? '#000' : 'e.g. 2px'}
                    className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Node presets */}
        {!isEdge && activeTab === 'presets' && canStyleThis && (
          <div className="space-y-2">
            <div className="flex gap-1 mb-2 flex-wrap">
              {['all', 'flow', 'color', 'effect'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setPresetFilter(filter)}
                  className={`text-[8px] px-1.5 py-0.5 rounded font-medium capitalize cursor-pointer transition-colors ${
                    presetFilter === filter
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter}
                </button>
              ))}
              {selectedShape && (
                <button
                  onClick={() => setPresetFilter(selectedShape)}
                  className={`text-[8px] px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors flex items-center gap-0.5 ${
                    presetFilter === selectedShape
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <ShapeIcon shape={selectedShape} color={presetFilter === selectedShape ? '#6366f1' : '#94a3b8'} size={10} />
                  This shape
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {filteredPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                  title={preset.name}
                >
                  <ShapeIcon shape={preset.shape || 'rect'} color={preset.styles.fill || preset.styles.stroke || '#6366f1'} size={16} />
                  <span className="text-[8px] text-zinc-400 dark:text-zinc-500 leading-none">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current style summary */}
      {canStyleThis && Object.keys(localStyle).length > 0 && (
        <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 break-all">
            {isEdge
              ? `linkStyle ${selectedElement.edgeIndex ?? '?'} ${styleObjectToString(localStyle)}`
              : `style ${selectedElement.id} ${styleObjectToString(localStyle)}`}
          </div>
        </div>
      )}
    </div>
  )
}
