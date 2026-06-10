import { Palette, X } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { PALETTE_PRESETS } from '../data/diagrams'
import { useI18n } from '../i18n/I18nProvider'

const KEYS = ['primaryColor', 'secondaryColor', 'lineColor', 'primaryBorderColor', 'primaryTextColor']
const KEY_LABELS = {
  primaryColor: 'common.primary',
  secondaryColor: 'common.secondary',
  lineColor: 'common.line',
  primaryBorderColor: 'common.background',
  primaryTextColor: 'common.text',
}

export default function ColorPalette() {
  const { themeColors, paletteOpen, togglePalette, setPaletteOpen, setThemeColors, resetThemeColors, applyPreset, activeDiagram } = useEditorStore()
  const { t } = useI18n()

  const handleChange = (key, value) => {
    setThemeColors({ [key]: value })
  }

  const handlePreset = (colors) => {
    applyPreset(colors)
  }

  return (
    <div className="relative">
      <button
        onClick={togglePalette}
        className="p-1.5 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        title={t('common.diagramColors')}
      >
        <Palette size={14} />
      </button>

      {paletteOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPaletteOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {t('diagrams.' + activeDiagram?.id)} {t('common.colors')}
              </span>
              <button onClick={() => setPaletteOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                <X size={12} />
              </button>
            </div>
            {KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-2 mb-1.5">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">{t(KEY_LABELS[key])}</label>
                <input
                  type="color"
                  value={themeColors[key] || '#6366f1'}
                  onChange={e => handleChange(key, e.target.value)}
                  className="w-8 h-6 p-0.5 border border-zinc-300 dark:border-zinc-600 rounded cursor-pointer bg-transparent"
                />
              </div>
            ))}

            <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide block mb-1.5">{t('common.presets')}</span>
              <div className="flex gap-1.5">
                {Object.entries(PALETTE_PRESETS).map(([name, colors]) => (
                  <button
                    key={name}
                    onClick={() => handlePreset(colors)}
                    className="w-6 h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: colors.primaryColor }}
                    title={t('presets.' + name)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={resetThemeColors}
              className="mt-2 w-full text-xs py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
            >
              {t('common.reset')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
