import { useState } from 'react'
import { Sparkles, X, Check } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { ELEMENT_STYLE_PRESETS } from '../data/stylePresets'
import { useI18n } from '../i18n/I18nProvider'

export default function StylePresets() {
  const { selectedElement, applyPresetToElement } = useEditorStore()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState(null)

  const handleApply = (preset) => {
    if (!selectedElement) return
    applyPresetToElement(selectedElement.id, preset.styles)
    setActivePreset(preset.id)
    setTimeout(() => setActivePreset(null), 800)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 shadow-md hover:shadow-lg text-zinc-500 dark:text-zinc-400 hover:text-purple-500 dark:hover:text-purple-400 cursor-pointer transition-all"
        title={t('stylePresets.title')}
      >
        <Sparkles size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 w-52 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {t('stylePresets.header')}
              </span>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                <X size={12} />
              </button>
            </div>

            {!selectedElement && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center py-2">
                {t('stylePresets.clickElement')}
              </p>
            )}

            <div className="grid grid-cols-3 gap-1.5">
              {ELEMENT_STYLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleApply(preset)}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-all group"
                  title={preset.name}
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-600 group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: preset.styles.fill || 'transparent',
                        borderColor: preset.styles.stroke || undefined,
                        borderWidth: preset.styles['stroke-width'] || undefined,
                        borderStyle: preset.styles['stroke-dasharray'] ? 'dashed' : undefined,
                      }}
                    />
                    {activePreset === preset.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-zinc-400 dark:text-zinc-500 leading-none">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
