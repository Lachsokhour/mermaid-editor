export function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function hexToHsl(hex) {
  let r = 0, g = 0, b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16)
    g = parseInt(hex.slice(3, 5), 16)
    b = parseInt(hex.slice(5, 7), 16)
  }
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
      case g: h = ((b - r) / d + 2); break
      case b: h = ((r - g) / d + 4); break
    }
    h *= 60
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function generatePalette(baseH, baseS, baseL, harmony, tuning = {}) {
  const { satScale = 100, briScale = 100, warmShift = 0 } = tuning
  const warp = h => ((h % 360) + 360) % 360
  const sat = v => Math.max(0, Math.min(100, Math.round(v * satScale / 100)))
  const bri = v => Math.max(0, Math.min(100, Math.round(v * briScale / 100)))
  const ws = warmShift / 100 * 30 // max shift ±30°

  const H = warp(baseH + ws)

  let hues
  switch (harmony) {
    case 'comp':
      hues = [H, warp(H + 180), warp(H + 180), H, H]
      break
    case 'analog':
      hues = [H, warp(H - 25), warp(H + 15), warp(H - 35), H]
      break
    case 'triad':
      hues = [H, warp(H + 120), warp(H + 240), H, warp(H + 120)]
      break
    default: // mono
      hues = [H, H, H, H, H]
  }

  const sats = [baseS, Math.round(baseS * 0.3), baseS, Math.round(baseS * 0.15), Math.round(baseS * 0.9)]
  const bris = [baseL, Math.round(baseL * 1.6), Math.round(baseL * 0.7), Math.round(baseL * 1.8), Math.round(baseL * 0.2)]

  return {
    primaryColor: hslToHex(warp(hues[0]), sat(sats[0]), bri(bris[0])),
    secondaryColor: hslToHex(warp(hues[1]), sat(sats[1]), bri(bris[1])),
    lineColor: hslToHex(warp(hues[2]), sat(sats[2]), bri(bris[2])),
    primaryBorderColor: hslToHex(warp(hues[3]), sat(sats[3]), bri(bris[3])),
    primaryTextColor: hslToHex(warp(hues[4]), sat(sats[4]), bri(bris[4])),
  }
}

export function getDefaultPaletteParams() {
  return { h: 250, s: 60, l: 55, harmony: 'mono', satScale: 100, briScale: 100, warmShift: 0 }
}

export const HARMONY_LABELS = {
  mono: 'Monochromatic',
  comp: 'Complementary',
  analog: 'Analogous',
  triad: 'Triadic',
}
