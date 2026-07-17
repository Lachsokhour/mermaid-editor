import { useEditorStore } from '../store/editorStore'

function getFontUrl(locale) {
  const base = 'https://fonts.googleapis.com/css2?'
  const rubik = 'family=Rubik:wght@400;500;600;700'
  const kantumruy = 'family=Kantumruy+Pro:wght@400;500;600;700'
  const googleSans = 'family=Google+Sans:wght@400..700'
  if (locale === 'kh') return `${base}${kantumruy}&${rubik}&${googleSans}&display=swap`
  return `${base}${rubik}&${googleSans}&display=swap`
}

let _fontFaceCss = null
let _fontFaceLocale = null

export async function preloadExportFonts(locale) {
  const loc = locale || 'en'
  if (_fontFaceCss && _fontFaceLocale === loc) return
  try {
    const cssUrl = getFontUrl(loc)
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
    _fontFaceLocale = loc
  } catch (e) {
    console.warn('Failed to preload export fonts:', e)
  }
}

function getExportLocale() {
  try { return document.documentElement.lang === 'km' ? 'kh' : 'en' } catch { return 'en' }
}

function getFontStyle() {
  const loc = getExportLocale()
  if (_fontFaceCss && _fontFaceLocale === loc) {
    return `<style>${_fontFaceCss}</style>`
  }
  const url = getFontUrl(loc).replace(/&/g, '&amp;')
  return `<style>@import url('${url}');</style>`
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

// Preserved for non-browser SVG consumption (Inkscape, Typst, Office).
// Not used in the PNG export pipeline — modern browsers render foreignObject
// correctly in SVG-as-image (Chrome, Firefox, Safari via data: URI).
function extractFoStyles(fo) {
  const result = {}
  const divEl = fo.querySelector('div')
  if (divEl) {
    const ds = divEl.getAttribute('style') || ''
    let m
    if ((m = ds.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/))) result.color = m[1].trim()
    if ((m = ds.match(/font-weight\s*:\s*(\w+)/))) result.fontWeight = m[1]
    if ((m = ds.match(/font-size\s*:\s*([\d.]+)px/))) result.fontSize = m[1]
    if ((m = ds.match(/font-family\s*:\s*([^;]+)/))) result.fontFamily = m[1].trim()
  }
  const spanEl = fo.querySelector('span')
  if (spanEl) {
    const ss = spanEl.getAttribute('style') || ''
    let m
    if (!result.color && (m = ss.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/))) result.color = m[1].trim()
    if (!result.fontWeight && (m = ss.match(/font-weight\s*:\s*(\w+)/))) result.fontWeight = m[1]
    if (!result.fontSize && (m = ss.match(/font-size\s*:\s*([\d.]+)px/))) result.fontSize = m[1]
    if (!result.fontFamily && (m = ss.match(/font-family\s*:\s*([^;]+)/))) result.fontFamily = m[1].trim()
  }
  const pEl = fo.querySelector('p')
  if (pEl) {
    const ps = pEl.getAttribute('style') || ''
    let m
    if (!result.color && (m = ps.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/))) result.color = m[1].trim()
    if (!result.fontSize && (m = ps.match(/font-size\s*:\s*([\d.]+)px/))) result.fontSize = m[1]
  }
  return result
}

function getFoTextLines(fo) {
  const pEl = fo.querySelector('p')
  const target = pEl || fo.querySelector('span') || fo
  const html = target.innerHTML || target.textContent || ''
  return html.split(/<br(?:\s[^>]*)?\/?>/i).map(s => {
    const tmp = document.createElement('div')
    tmp.innerHTML = s
    return (tmp.textContent || '').trim()
  }).filter(Boolean)
}

function findShapeCenter(fo) {
  const parentG = fo.parentElement
  if (!parentG) return null
  const shape = parentG.querySelector('rect, polygon, ellipse, circle')
  if (!shape) return null
  const tag = shape.tagName.toLowerCase()
  if (tag === 'rect') {
    const x = parseFloat(shape.getAttribute('x')) || 0
    const y = parseFloat(shape.getAttribute('y')) || 0
    const w = parseFloat(shape.getAttribute('width')) || 0
    const h = parseFloat(shape.getAttribute('height')) || 0
    return { cx: x + w / 2, cy: y + h / 2 }
  }
  if (tag === 'circle') {
    return { cx: parseFloat(shape.getAttribute('cx')) || 0, cy: parseFloat(shape.getAttribute('cy')) || 0 }
  }
  if (tag === 'ellipse') {
    return { cx: parseFloat(shape.getAttribute('cx')) || 0, cy: parseFloat(shape.getAttribute('cy')) || 0 }
  }
  return null
}

export function stripForeignObjects(svg) {
  const styleMatch = svg.match(/<style[^>]*>[\s\S]*?<\/style>/i)
  const svgWithoutStyle = styleMatch ? svg.replace(styleMatch[0], '<style></style>') : svg
  const doc = new DOMParser().parseFromString(svgWithoutStyle, 'image/svg+xml')
  const root = doc.documentElement
  const foList = root.querySelectorAll('foreignObject')
  for (let i = foList.length - 1; i >= 0; i--) {
    const fo = foList[i]
    const text = (fo.textContent || '').trim()
    if (!text) { fo.remove(); continue }
    const lines = getFoTextLines(fo)
    if (lines.length === 0) { fo.remove(); continue }
    const styles = extractFoStyles(fo)
    const center = findShapeCenter(fo)
    let cx = 0, cy = 0
    if (center) { cx = center.cx; cy = center.cy } else {
      const foX = parseFloat(fo.getAttribute('x')) || 0
      const foY = parseFloat(fo.getAttribute('y')) || 0
      const foW = parseFloat(fo.getAttribute('width')) || 0
      const foH = parseFloat(fo.getAttribute('height')) || 0
      cx = foX + foW / 2; cy = foY + foH / 2
    }
    const t = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
    t.setAttribute('x', cx); t.setAttribute('text-anchor', 'middle')
    t.setAttribute('dominant-baseline', 'central')
    if (styles.fontSize) t.setAttribute('font-size', styles.fontSize + 'px')
    if (styles.fontFamily) t.setAttribute('font-family', styles.fontFamily)
    if (styles.color) t.setAttribute('fill', styles.color)
    if (styles.fontWeight) t.setAttribute('font-weight', styles.fontWeight)
    if (lines.length === 1) {
      t.setAttribute('y', cy); t.textContent = lines[0]
    } else {
      const fontSize = styles.fontSize ? parseFloat(styles.fontSize) : 14
      const lineH = fontSize * 1.3
      const startY = cy - ((lines.length - 1) * lineH) / 2
      lines.forEach((line, idx) => {
        const ts = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
        ts.setAttribute('x', cx); ts.setAttribute('y', startY + idx * lineH)
        ts.textContent = line
        t.appendChild(ts)
      })
    }
    fo.parentNode.replaceChild(t, fo)
  }
  let result = new XMLSerializer().serializeToString(root)
  if (styleMatch) result = result.replace(/<style\s*\/>/, styleMatch[0])
  return result
}

function getCanvasSvgData() {
  const raw = _rawSvgCache
  if (raw) {
    return embedFonts(raw)
  }
  const svgEl = getSvgEl()
  if (!svgEl) return null
  const clone = svgEl.cloneNode(true)
  const s = new XMLSerializer().serializeToString(clone)
  return embedFonts(s)
}

function sanitizeSvgXml(xml) {
  return xml.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
}

async function svgToCanvas(svgEl, scale = 3) {
  const { width, height } = parseViewBox(svgEl)
  const padding = 20
  const cw = (width + padding * 2) * scale
  const ch = (height + padding * 2) * scale

  const svgData = getCanvasSvgData()
  if (!svgData) throw new Error('No SVG data available')

  let sanitized = svgData
  if (!sanitized.includes('xmlns=')) {
    sanitized = sanitized.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  sanitized = sanitizeSvgXml(sanitized)

  const blob = new Blob([sanitized], { type: 'image/svg+xml;charset=utf-8' })
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
      reject(new Error('Failed to render SVG to canvas'))
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
    await preloadExportFonts(getExportLocale())
    const canvas = await svgToCanvas(svgEl, 3)
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
    await preloadExportFonts(getExportLocale())
    const canvas = await svgToCanvas(svgEl, 3)
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
