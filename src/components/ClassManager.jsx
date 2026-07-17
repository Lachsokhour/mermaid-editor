import { useState } from 'react'
import { Layers, X, Plus, Paintbrush } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { parseClassDefs, parseClassAssignments, styleObjectToString, parseStyleString, DEFAULT_CLASS_STYLE } from '../utils/styleParser'
import { useI18n } from '../i18n/I18nProvider'

export default function ClassManager() {
  const { currentCode, selectedElement, updateClassDef, removeClassDef, assignClassToNodes } = useEditorStore()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [newClassName, setNewClassName] = useState('')
  const [newClassStyle, setNewClassStyle] = useState(DEFAULT_CLASS_STYLE)

  const classDefs = parseClassDefs(currentCode)
  const classAssignments = parseClassAssignments(currentCode)

  const handleCreateClass = () => {
    if (!newClassName.trim()) return
    const styles = parseStyleString(newClassStyle)
    updateClassDef(newClassName.trim(), styles)
    setNewClassName('')
    setNewClassStyle(DEFAULT_CLASS_STYLE)
  }

  const handleEditClass = (name) => {
    setEditingClass(name)
    setNewClassName(name)
    setNewClassStyle(styleObjectToString(classDefs[name]))
  }

  const handleSaveEdit = () => {
    if (!editingClass || !newClassName.trim()) return
    const styles = parseStyleString(newClassStyle)
    updateClassDef(newClassName.trim(), styles)
    setEditingClass(null)
    setNewClassName('')
    setNewClassStyle('')
  }

  const handleAssignClass = (className) => {
    if (!selectedElement) return
    assignClassToNodes([selectedElement.id], className)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 shadow-md hover:shadow-lg text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer transition-all"
        title="Class Manager"
      >
        <Layers size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Style Classes
              </span>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                <X size={12} />
              </button>
            </div>

            {/* Existing class definitions */}
            <div className="space-y-1.5 mb-3">
              {Object.entries(classDefs).map(([name, styles]) => (
                <div key={name} className="flex items-center gap-2 p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 group">
                  <div
                    className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 shrink-0"
                    style={{ backgroundColor: styles.fill || 'transparent' }}
                  />
                  <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 flex-1 truncate">{name}</span>
                  {selectedElement && (
                    <button
                      onClick={() => handleAssignClass(name)}
                      className="p-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-zinc-400 hover:text-indigo-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Apply to ${selectedElement.id}`}
                    >
                      <Paintbrush size={10} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClass(name)}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={10} />
                  </button>
                  <button
                    onClick={() => removeClassDef(name)}
                    className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Create new class */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                {editingClass ? `Edit: ${editingClass}` : 'New classDef'}
              </div>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="class name"
                  className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                />
              </div>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={newClassStyle}
                  onChange={e => setNewClassStyle(e.target.value)}
                  placeholder="fill:#fff,stroke:#333"
                  className="flex-1 text-[10px] font-mono px-1.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400"
                />
              </div>
              <div className="flex gap-1.5">
                {editingClass ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 text-[10px] py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingClass(null); setNewClassName(''); setNewClassStyle('') }}
                      className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-[10px]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateClass}
                    className="flex-1 text-[10px] py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                  >
                    Create classDef
                  </button>
                )}
              </div>
            </div>

            {/* Class assignments info */}
            {Object.keys(classAssignments).length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-500">
                  Assignments: {Object.entries(classAssignments).map(([id, cls]) => `${id}→${cls}`).join(', ')}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
