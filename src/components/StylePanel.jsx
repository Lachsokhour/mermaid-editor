import { useState } from 'react'
import { Shuffle, X, Palette } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { hslToHex, HARMONY_LABELS } from '../utils/palette'
import { useI18n } from '../i18n/I18nProvider'

export default function StylePanel() {
  const { paletteParams, setPaletteParams, activeDiagram } = useEditorStore()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const { h, s, harmony, satScale, briScale, warmShift } = paletteParams

  function setField(field, value) {
    setPaletteParams({ ...paletteParams, [field]: value })
  }

  function shuffle() {
    setPaletteParams({ ...paletteParams, h: Math.floor(Math.random() * 360) })
  }

  const swatch = [
    { label: t('stylePanel.swatchPrimary'), color: 'primaryColor' },
    { label: t('stylePanel.swatchBg'), color: 'secondaryColor' },
    { label: t('stylePanel.swatchLine'), color: 'lineColor' },
    { label: t('stylePanel.swatchCard'), color: 'primaryBorderColor' },
    { label: t('stylePanel.swatchText'), color: 'primaryTextColor' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 shadow-md hover:shadow-lg text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition-all"
        title={t('common.styles')}
      >
        <Palette size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {t('diagrams.' + activeDiagram?.id)} {t('common.style')}
              </span>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                <X size={12} />
              </button>
            </div>

            {/* Hue slider */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{t('stylePanel.hue')}</label>
                <span className="text-[10px] text-zinc-400 font-mono">{h}°</span>
              </div>
              <div className="relative h-5 rounded-md overflow-hidden"
                style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
              >
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={h}
                  onChange={e => setField('h', +e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-0.5 bottom-0.5 w-1 rounded-full border-2 border-white shadow-md pointer-events-none"
                  style={{ left: `${(h / 360) * 100}%`, transform: 'translateX(-50%)', backgroundColor: hslToHex(h, 70, 50) }}
                />
              </div>
            </div>

            {/* Harmony selector */}
            <div className="mb-2.5">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mb-1">{t('common.harmony')}</label>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(HARMONY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setField('harmony', key)}
                    className={`text-[10px] px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      harmony === key
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swatch preview */}
            <div className="mb-2.5">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mb-1">{t('stylePanel.preview')}</label>
              <div className="flex gap-1">
                {swatch.map(({ label, color }) => {
                  const hue = paletteParams.h
                  const l = color === 'primaryColor' ? 55
                    : color === 'secondaryColor' ? 80
                    : color === 'lineColor' ? 40
                    : color === 'primaryBorderColor' ? 90
                    : 15
                  const sat = color === 'secondaryColor' || color === 'primaryBorderColor' ? 20 : 70
                  const hex = hslToHex(hue, sat, l)
                  return (
                    <div key={color} className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-7 h-7 rounded-md border border-zinc-300 dark:border-zinc-600"
                        style={{ backgroundColor: hex }}
                        title={label}
                      />
                      <span className="text-[7px] text-zinc-400">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Fine-tuning sliders */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{t('stylePanel.saturation')}</label>
                  <span className="text-[10px] text-zinc-400 font-mono">{satScale}%</span>
                </div>
                <input
                  type="range" min="10" max="200" value={satScale}
                  onChange={e => setField('satScale', +e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{t('stylePanel.brightness')}</label>
                  <span className="text-[10px] text-zinc-400 font-mono">{briScale}%</span>
                </div>
                <input
                  type="range" min="50" max="200" value={briScale}
                  onChange={e => setField('briScale', +e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{t('stylePanel.warmth')}</label>
                  <span className="text-[10px] text-zinc-400 font-mono">{warmShift > 0 ? `+${warmShift}` : warmShift}</span>
                </div>
                <input
                  type="range" min="-100" max="100" value={warmShift}
                  onChange={e => setField('warmShift', +e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-indigo-500"
                />
              </div>
            </div>

            {/* Shuffle */}
            <button
              onClick={shuffle}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
            >
              <Shuffle size={11} />
              {t('stylePanel.shuffle')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
