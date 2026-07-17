import { useEditorStore } from '../store/editorStore'

const FONT_STYLE = `<style>
@import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&amp;family=Rubik:wght@400;500;600;700&amp;display=swap');
</style>`

let _fontFaceCss = null

export async function preloadExportFonts() {
  if (_fontFaceCss) return
  try {
    const cssUrl = 'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&display=swap'
    const res = await fetch(cssUrl)
    const css = await res.text()

    const urlRegex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g
    const urls = [...css.matchAll(urlRegex)].map(m => m[1])

    const dataUris = await Promise.all(urls.map(async (url) => {
      const r = await fetch(url)
      const blob = await r.blob()
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    }))

    let i = 0
    _fontFaceCss = css.replace(urlRegex, () => `url(${dataUris[i++]})`)
  } catch (e) {
    console.warn('Failed to preload export fonts:', e)
  }
}

function getFontStyle() {
  if (_fontFaceCss) {
    return `<style>${_fontFaceCss}</style>`
  }
  return FONT_STYLE
}

export function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    if (successMsg) showToast(successMsg, 'success')
  }).catch(() => {
    showToast('Failed to copy', 'error')
  })
}

export function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

export function showToast(message, type = 'info') {
  const event = new CustomEvent('toast', { detail: { message, type } })
  window.dispatchEvent(event)
}

let _rawSvgCache = null

export function setRawSvg(svg) {
  _rawSvgCache = svg
}

function getSvgEl() {
  return document.querySelector('#mermaid-container svg')
}

function embedFonts(svgString) {
  const style = getFontStyle()
  return svgString.replace(/(<svg[^>]*>)/, '$1' + style)
}

function getSvgData(svgEl) {
  if (_rawSvgCache) {
    return embedFonts(_rawSvgCache)
  }
  const clone = svgEl.cloneNode(true)
  const xml = new XMLSerializer().serializeToString(clone)
  let s = xml
  if (!s.includes('xmlns='))
    s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  if (s.includes('xlink:') && !s.includes('xmlns:xlink='))
    s = s.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  return embedFonts(s)
}

function parseViewBox(svgEl) {
  const vb = svgEl.getAttribute('viewBox')
  if (vb) {
    const parts = vb.split(/\s+/).map(Number)
    if (parts.length === 4) return { width: parts[2], height: parts[3] }
  }
  return { width: 800, height: 600 }
}

async function ensureFontsLoaded() {
  try {
    await document.fonts.load('500 1em "Kantumruy Pro"')
    await document.fonts.load('400 1em "Rubik"')
  } catch {}
}

function stripForeignObjects(svg) {
  // foreignObject always taints canvas when SVG is loaded as an <img>.
  // Replace each with an SVG <text> element positioned at the same place.
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const root = doc.documentElement
  const fos = root.querySelectorAll('foreignObject')
  for (let i = fos.length - 1; i >= 0; i--) {
    const fo = fos[i]
    const x = parseFloat(fo.getAttribute('x')) || 0
    const y = parseFloat(fo.getAttribute('y')) || 0
    const w = parseFloat(fo.getAttribute('width')) || 0
    const h = parseFloat(fo.getAttribute('height')) || 0
    const text = (fo.textContent || '').trim()
    if (!text) { fo.remove(); continue }

    // Walk children to inspect style on the deepest inline element
    let fontSize = null, fontFamily = null
    let node = fo.firstElementChild
    while (node && node.firstElementChild) { node = node.firstElementChild }
    if (node) {
      const st = node.getAttribute('style') || ''
      const fs = st.match(/font-size\s*:\s*([\d.]+)px/)
      if (fs) fontSize = fs[1]
      const ff = st.match(/font-family\s*:\s*([^;]+)/)
      if (ff) fontFamily = ff[1].trim()
    }

    const t = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
    t.setAttribute('x', x + w / 2)
    t.setAttribute('y', y + h / 2)
    t.setAttribute('text-anchor', 'middle')
    t.setAttribute('dominant-baseline', 'central')
    if (fontSize) t.setAttribute('font-size', fontSize + 'px')
    if (fontFamily) t.setAttribute('font-family', fontFamily)

    t.textContent = text
    fo.parentNode.replaceChild(t, fo)
  }
  return new XMLSerializer().serializeToString(root)
}

function getCanvasSvgData() {
  const raw = _rawSvgCache
  if (raw) {
    return embedFonts(stripForeignObjects(raw))
  }
  const svgEl = getSvgEl()
  if (!svgEl) return null
  const clone = svgEl.cloneNode(true)
  const s = new XMLSerializer().serializeToString(clone)
  return embedFonts(stripForeignObjects(s))
}

async function svgToCanvas(svgEl, scale = 2) {
  const { width, height } = parseViewBox(svgEl)
  const padding = 20
  const cw = (width + padding * 2) * scale
  const ch = (height + padding * 2) * scale

  const svgData = getCanvasSvgData()
  if (!svgData) throw new Error('No SVG data available')

  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cw, ch)

  await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, padding * scale, padding * scale, width * scale, height * scale)
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to render SVG'))
    }
    img.src = url
  })

  return canvas
}

function pad(n) { return String(n).padStart(2, '0') }

function getExportFilename(ext) {
  const state = useEditorStore.getState()
  const name = state.activeDiagram?.id || 'diagram'
  const d = new Date()
  const ts = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return `${name}-${ts}.${ext}`
}

export function downloadRaw() {
  const code = useEditorStore.getState().currentCode
  if (!code) { showToast('No diagram to download', 'warning'); return }
  const blob = new Blob([code], { type: 'text/plain' })
  downloadBlob(blob, getExportFilename('mmd'))
  showToast('Raw diagram downloaded', 'success')
}

export async function downloadSVG() {
  const svgEl = getSvgEl()
  if (!svgEl) { showToast('No diagram to download', 'warning'); return }
  const svgData = getSvgData(svgEl)
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  downloadBlob(blob, getExportFilename('svg'))
  showToast('SVG downloaded', 'success')
}

export async function downloadPNG() {
  const svgEl = getSvgEl()
  if (!svgEl) { showToast('No diagram to download', 'warning'); return }
  try {
    await ensureFontsLoaded()
    const canvas = await svgToCanvas(svgEl, 2)
    canvas.toBlob(b => {
      if (b) downloadBlob(b, getExportFilename('png'))
    })
  } catch (e) {
    console.error('PNG export failed:', e)
    showToast('Failed to export PNG', 'error')
  }
}

export async function copyImage() {
  const svgEl = getSvgEl()
  if (!svgEl) { showToast('No diagram to copy', 'warning'); return }
  try {
    await ensureFontsLoaded()
    const canvas = await svgToCanvas(svgEl, 2)
    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      showToast('Image copied to clipboard', 'success')
    }
  } catch (e) {
    console.error('Copy image failed:', e)
    showToast('Failed to copy image', 'error')
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
