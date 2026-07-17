import { useState } from 'react'
import { Code2, X, FileCode } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { THEME_CSS_PRESETS } from '../data/stylePresets'
import { useI18n } from '../i18n/I18nProvider'

export default function ThemeCSSEditor() {
  const { themeCSS, setThemeCSS } = useEditorStore()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState('default')

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.id)
    setThemeCSS(preset.css)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 shadow-md hover:shadow-lg text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 cursor-pointer transition-all"
        title={t('themeCSS.title')}
      >
        <Code2 size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5">
                <FileCode size={12} className="text-amber-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {t('themeCSS.header')}
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                <X size={12} />
              </button>
            </div>

            {/* Preset selector */}
            <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{t('themeCSS.presets')}</div>
              <div className="flex flex-wrap gap-1">
                {THEME_CSS_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`text-[9px] px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      activePreset === preset.id
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* CSS editor */}
            <div className="p-3">
              <textarea
                value={themeCSS}
                onChange={e => {
                  setThemeCSS(e.target.value)
                  setActivePreset('custom')
                }}
                placeholder={`/* Custom CSS for the diagram SVG */\n.node rect {\n  rx: 8;\n  ry: 8;\n}\n.edgePath .path {\n  stroke-width: 2px;\n}`}
                className="w-full h-40 text-[11px] font-mono p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-400 resize-none"
                spellCheck={false}
              />
              <div className="mt-1.5 text-[9px] text-zinc-400 dark:text-zinc-500">
                {t('themeCSS.helpText')}
              </div>
            </div>

            {themeCSS && (
              <div className="px-3 pb-2">
                <button
                  onClick={() => { setThemeCSS(''); setActivePreset('default') }}
                  className="w-full text-[10px] py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  {t('themeCSS.clearCSS')}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
