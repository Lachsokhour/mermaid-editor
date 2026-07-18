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

// Used by captureLiveSvg() as a fallback when getComputedStyle fails.
// Also preserved for non-browser SVG consumption (Inkscape, Typst, Office).
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

function extractComputedFoStyles(liveFo) {
  const result = {}
  const div = liveFo.querySelector('div')
  if (div) {
    try {
      const cs = getComputedStyle(div)
      result.color = cs.color
      result.fontWeight = cs.fontWeight
      result.fontSize = parseFloat(cs.fontSize) || 14
      result.fontFamily = cs.fontFamily
      const lh = parseFloat(cs.lineHeight)
      if (lh && lh > 0) result.lineHeight = lh
    } catch {
      Object.assign(result, extractFoStyles(liveFo))
    }
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

function captureLiveSvg(svgEl) {
  const svgScreenRect = svgEl.getBoundingClientRect()
  if (svgScreenRect.width === 0 || svgScreenRect.height === 0) {
    const clone = svgEl.cloneNode(true)
    return stripForeignObjects(new XMLSerializer().serializeToString(clone))
  }
  const vb = svgEl.getAttribute('viewBox') || '0 0 800 600'
  const vbParts = vb.split(/\s+/).map(Number)
  const vbW = vbParts[2]
  const vbH = vbParts[3]
  const scaleX = svgScreenRect.width / vbW
  const scaleY = svgScreenRect.height / vbH
  const NS = 'http://www.w3.org/2000/svg'
  const clone = svgEl.cloneNode(true)
  const liveFos = svgEl.querySelectorAll('foreignObject')
  const cloneFos = clone.querySelectorAll('foreignObject')

  for (let i = 0; i < liveFos.length; i++) {
    const liveFo = liveFos[i]
    const cloneFo = cloneFos[i]
    const text = (liveFo.textContent || '').trim()
    if (!text) { cloneFo.remove(); continue }
    const lines = getFoTextLines(liveFo)
    if (lines.length === 0) { cloneFo.remove(); continue }
    const foRect = liveFo.getBoundingClientRect()
    const cx = (foRect.left - svgScreenRect.left + foRect.width / 2) / scaleX
    const cy = (foRect.top - svgScreenRect.top + foRect.height / 2) / scaleY
    const styles = extractComputedFoStyles(liveFo)
    const t = document.createElementNS(NS, 'text')
    t.setAttribute('x', cx)
    t.setAttribute('text-anchor', 'middle')
    // dy shifts baseline ~0.33em below center for reliable vertical centering
    // (dominant-baseline is not supported in SVG-as-image context)
    const fontSize = styles.fontSize || 14
    const lineH = styles.lineHeight || fontSize * 1.3
    if (styles.fontSize) t.setAttribute('font-size', styles.fontSize + 'px')
    if (styles.fontFamily) t.setAttribute('font-family', styles.fontFamily)
    if (styles.color) t.setAttribute('fill', styles.color)
    if (styles.fontWeight && styles.fontWeight !== '400') t.setAttribute('font-weight', styles.fontWeight)
    if (lines.length === 1) {
      t.setAttribute('y', cy)
      t.setAttribute('dy', '0.33em')
      t.textContent = lines[0]
    } else {
      const startY = cy - ((lines.length - 1) * lineH) / 2
      lines.forEach((line, idx) => {
        const ts = document.createElementNS(NS, 'tspan')
        ts.setAttribute('x', cx)
        ts.setAttribute('y', startY + idx * lineH)
        ts.textContent = line
        t.appendChild(ts)
      })
    }
    cloneFo.remove()
    clone.appendChild(t)
  }

  let result = new XMLSerializer().serializeToString(clone)
  if (!result.includes('xmlns='))
    result = result.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  if (result.includes('xlink:') && !result.includes('xmlns:xlink='))
    result = result.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  return result
}

function getCanvasSvgData(svgEl, stripFo = false) {
  if (stripFo) {
    const el = svgEl || getSvgEl()
    if (!el) return null
    return captureLiveSvg(el)
  }
  const raw = _rawSvgCache
  let svg = raw
  if (!svg) {
    const el = svgEl || getSvgEl()
    if (!el) return null
    const clone = el.cloneNode(true)
    svg = new XMLSerializer().serializeToString(clone)
  }
  if (!svg.includes('xmlns='))
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  if (svg.includes('xlink:') && !svg.includes('xmlns:xlink='))
    svg = svg.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  return svg
}

function sanitizeSvgXml(xml) {
  return xml.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
}

async function svgToCanvas(svgEl, scale = 3) {
  const vb = svgEl.getAttribute('viewBox')
  const parts = vb ? vb.split(/\s+/).map(Number) : []
  const width = parts.length === 4 ? parts[2] : 800
  const height = parts.length === 4 ? parts[3] : 600
  if (!width || !height || !isFinite(width) || !isFinite(height)) {
    throw new Error(`Invalid viewBox: ${vb}`)
  }
  const padding = 20
  const cw = Math.round((width + padding * 2) * scale)
  const ch = Math.round((height + padding * 2) * scale)
  if (cw > 10000 || ch > 10000) {
    throw new Error(`Canvas too large: ${cw}x${ch}`)
  }

  const svgData = getCanvasSvgData(svgEl, true)
  if (!svgData) throw new Error('No SVG data available')

  let xml = svgData
  // Embed fonts using preloaded data-URI @font-face (does not taint canvas)
  if (_fontFaceCss && !xml.includes('@font-face')) {
    xml = xml.replace(/(<svg[^>]*>)/, '$1<style>' + _fontFaceCss + '</style>')
  }
  if (!xml.includes('xmlns=')) {
    xml = xml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  xml = sanitizeSvgXml(xml)

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cw, ch)

  async function loadBlobImage(blob) {
    const url = URL.createObjectURL(blob)
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image()
        i.onload = () => { URL.revokeObjectURL(url); resolve(i) }
        i.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img load failed')) }
        i.src = url
      })
      return img
    } catch (e) {
      URL.revokeObjectURL(url)
      throw e
    }
  }

  async function loadDataImage(xml) {
    const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    return new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('data URI img load failed'))
      i.src = uri
    })
  }

  async function drawAndCheck(img) {
    ctx.drawImage(img, padding * scale, padding * scale, width * scale, height * scale)
    try { canvas.toDataURL(); return canvas }
    catch { throw new Error('canvas tainted after drawImage') }
  }

  try {
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const img = await loadBlobImage(blob)
    return await drawAndCheck(img)
  } catch (e) {
    console.warn('blob: URI failed, retrying with data: URI —', e.message)
  }

  try {
    const img = await loadDataImage(xml)
    return await drawAndCheck(img)
  } catch (e) {
    console.warn('data: URI also failed —', e.message)
  }

  throw new Error('Failed to render SVG to canvas (tried blob: and data: URI)')
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
    const canvas = await svgToCanvas(svgEl, 4)
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
    const canvas = await svgToCanvas(svgEl, 4)
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
