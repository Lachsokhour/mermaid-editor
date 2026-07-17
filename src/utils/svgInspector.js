function extractNodeId(dataId) {
  if (!dataId) return ''
  let id = dataId
  id = id.replace(/^mermaid-render-\d+-/, '')
  const diagramTypes = /^(flowchart|sequence|classDiagram|stateDiagram|erDiagram|gitGraph|block|c4|architecture|gantt|mindmap|requirement|quadrant|sankey|radar|packet|pie|ishikawa|kanban|timeline|journey|venn|wardley|info|eventmodeling)-/
  if (diagramTypes.test(id)) {
    id = id.replace(diagramTypes, '')
  }
  const internalPrefixes = /^(classId|stateId|nodeId|actorId|actor2|er)-/
  if (internalPrefixes.test(id)) {
    id = id.replace(internalPrefixes, '')
  }
  id = id.replace(/-(\d+)$/, '')
  return id
}

const CLICK_SELECTORS = [
  'g[data-id]',
  'g.node',
  'g.edgePath',
  'g.edge',
  'g.actor',
  'g.messageLine',
  'g.line',
  'g.loop',
  'g.alt',
  'g.opt',
  'g.par',
  'g.rect',
  'g.circle',
  'g.cluster',
].join(', ')

const EDGE_CLASSES = new Set(['edgePath', 'edge', 'messageLine', 'line'])
const NODE_CLASSES = new Set(['node', 'actor', 'rect', 'circle', 'cluster'])

function inspectSvgElements(container) {
  if (!container) return []
  const elements = []
  const nodes = container.querySelectorAll(CLICK_SELECTORS)

  nodes.forEach(el => {
    const dataId = el.getAttribute('data-id')
    const id = extractNodeId(dataId || el.id)
    if (!id) return

    const label = el.querySelector('.label span, .label div')
    const text = label ? label.textContent.trim() : ''
    const classList = [...el.classList]
    const isEdge = classList.some(c => EDGE_CLASSES.has(c))
    const isCluster = el.classList.contains('cluster')

    let type = 'node'
    if (isEdge) type = 'edge'
    if (isCluster) type = 'cluster'

    const shapeEl = el.querySelector('rect, polygon, ellipse, circle, path')
    let shape = 'rect'
    if (shapeEl) {
      const tag = shapeEl.tagName.toLowerCase()
      if (tag === 'polygon') shape = 'polygon'
      else if (tag === 'ellipse') shape = 'ellipse'
      else if (tag === 'circle') shape = 'circle'
      else if (tag === 'path') shape = 'path'
    }

    elements.push({
      id,
      dataId: dataId || el.id,
      label: text,
      type,
      shape,
      element: el,
    })
  })

  return elements
}

function findSvgElement(container, nodeId) {
  if (!container) return null
  // Try matching by data-id suffix (e.g. data-id="flowchart-A" for nodeId "A")
  const allNodes = container.querySelectorAll('g[data-id]')
  for (const node of allNodes) {
    const did = node.getAttribute('data-id')
    if (extractNodeId(did) === nodeId) return node
  }
  return null
}

function highlightElement(container, nodeId, color = '#3b82f6') {
  clearHighlights(container)
  const el = findSvgElement(container, nodeId)
  if (!el) return

  el.setAttribute('data-selected', 'true')
  el.style.filter = `drop-shadow(0 0 4px ${color})`
  el.style.transition = 'filter 0.15s ease'
}

function clearHighlights(container) {
  if (!container) return
  container.querySelectorAll('[data-selected]').forEach(el => {
    el.removeAttribute('data-selected')
    el.style.filter = ''
    el.style.transition = ''
  })
}

function findParentNodeGroup(el) {
  let current = el
  while (current && current !== el.ownerSVGElement) {
    if (current.getAttribute && current.getAttribute('data-id')) return current
    if (current.classList) {
      const classList = [...current.classList]
      if (classList.some(c => NODE_CLASSES.has(c) || EDGE_CLASSES.has(c))) return current
    }
    current = current.parentNode
  }
  return null
}

function addClickHandlers(container, onSelect) {
  if (!container) return
  const interactiveEls = container.querySelectorAll(CLICK_SELECTORS)

  const edgeElements = []
  interactiveEls.forEach(el => {
    const classList = [...el.classList]
    if (classList.some(c => EDGE_CLASSES.has(c))) {
      edgeElements.push(el)
      // Add wider invisible hit area for easier clicking
      const path = el.querySelector('path')
      if (path && !el._hitAreaAdded) {
        const hitPath = path.cloneNode()
        hitPath.setAttribute('stroke', 'transparent')
        hitPath.setAttribute('stroke-width', '12')
        hitPath.setAttribute('fill', 'none')
        hitPath.setAttribute('stroke-linecap', 'round')
        hitPath.classList.add('edge-hitarea')
        hitPath.style.pointerEvents = 'stroke'
        el.insertBefore(hitPath, el.firstChild)
        el._hitAreaAdded = true
      }
    }
  })

  interactiveEls.forEach(el => {
    if (el._clickHandlerBound) return
    el.style.cursor = 'pointer'

    const handler = (e) => {
      e.stopPropagation()
      const target = findParentNodeGroup(e.target) || el
      const classList = [...target.classList]
      const isEdge = classList.some(c => EDGE_CLASSES.has(c))
      const dataId = target.getAttribute('data-id') || target.id || ''
      let id = extractNodeId(dataId)

      if (isEdge && !id) {
        const idx = edgeElements.indexOf(target)
        if (idx >= 0) {
          id = `__edge_${idx}`
        }
      }
      if (!id) return

      const label = target.querySelector('.label span, .label div, foreignObject div')
      const text = label ? label.textContent.trim() : ''

      onSelect({
        id,
        dataId: dataId || id,
        label: text,
        type: isEdge ? 'edge' : 'node',
        element: target,
        edgeOrderIndex: isEdge ? edgeElements.indexOf(target) : -1,
      })
    }

    el.addEventListener('click', handler)
    el._clickHandlerBound = true
  })
}

function removeClickHandlers(container) {
  if (!container) return
  container.querySelectorAll(CLICK_SELECTORS).forEach(el => {
    if (el._clickHandlerBound) {
      el.style.cursor = ''
    }
  })
}

function getElementBounds(element) {
  if (!element) return null
  try {
    const bbox = element.getBBox()
    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
  } catch {
    return null
  }
}

function findNodeById(svgString, nodeId) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const allNodes = doc.querySelectorAll('g[data-id]')
  for (const node of allNodes) {
    if (extractNodeId(node.getAttribute('data-id')) === nodeId) return node
  }
  return null
}

function getElementClasses(element) {
  if (!element) return []
  return [...element.classList].filter(c => !NODE_CLASSES.has(c) && !EDGE_CLASSES.has(c))
}

function getAvailableNodeIds(container) {
  if (!container) return []
  const ids = []
  container.querySelectorAll(CLICK_SELECTORS).forEach(el => {
    const dataId = el.getAttribute('data-id')
    const id = extractNodeId(dataId || el.id)
    if (id) ids.push(id)
  })
  return [...new Set(ids)]
}

export {
  extractNodeId,
  inspectSvgElements,
  findSvgElement,
  highlightElement,
  clearHighlights,
  addClickHandlers,
  removeClickHandlers,
  getElementBounds,
  findNodeById,
  getElementClasses,
  getAvailableNodeIds,
  CLICK_SELECTORS,
}
