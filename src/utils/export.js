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

export async function downloadSVG() {
  const svgEl = document.querySelector('#mermaid-container svg')
  if (!svgEl) { showToast('No diagram to download', 'warning'); return }
  const svgClone = svgEl.cloneNode(true)
  const vb = svgClone.getAttribute('viewBox')
  if (vb) {
    const [, , w, h] = vb.split(/\s+/).map(Number)
    svgClone.setAttribute('width', w)
    svgClone.setAttribute('height', h)
  }
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const blob = new Blob([svgClone.outerHTML], { type: 'image/svg+xml' })
  downloadBlob(blob, 'diagram.svg')
  showToast('SVG downloaded', 'success')
}

export async function downloadPNG() {
  const svgEl = document.querySelector('#mermaid-container svg')
  if (!svgEl) { showToast('No diagram to download', 'warning'); return }
  const svgClone = svgEl.cloneNode(true)
  svgClone.querySelectorAll('*').forEach(el => el.removeAttribute('style'))
  const vb = svgClone.getAttribute('viewBox')
  let width = 800, height = 600
  if (vb) {
    const parts = vb.split(/\s+/).map(Number)
    if (parts.length === 4) { width = parts[2]; height = parts[3] }
  }
  const padding = 20
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = (width + padding * 2) * scale
  canvas.height = (height + padding * 2) * scale
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.scale(scale, scale)
  const svgString = svgClone.outerHTML
  const img = new Image()
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  img.onload = () => {
    ctx.drawImage(img, padding, padding, width, height)
    URL.revokeObjectURL(url)
    canvas.toBlob(b => {
      if (b) downloadBlob(b, 'diagram.png')
    })
  }
  img.src = url
}

export async function copyImage() {
  const svgEl = document.querySelector('#mermaid-container svg')
  if (!svgEl) { showToast('No diagram to copy', 'warning'); return }
  const blob = await svgToPngBlob(svgEl)
  if (blob) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      showToast('Image copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy image', 'error')
    }
  }
}

function svgToPngBlob(svgEl) {
  return new Promise(resolve => {
    const clone = svgEl.cloneNode(true)
    clone.querySelectorAll('*').forEach(el => el.removeAttribute('style'))
    const vb = clone.getAttribute('viewBox')
    let width = 800, height = 600
    if (vb) {
      const parts = vb.split(/\s+/).map(Number)
      if (parts.length === 4) { width = parts[2]; height = parts[3] }
    }
    const padding = 20; const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = (width + padding * 2) * scale
    canvas.height = (height + padding * 2) * scale
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    const img = new Image()
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      ctx.drawImage(img, padding, padding, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(resolve)
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
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
