const STYLE_PROPS = {
  fill: { label: 'Fill', type: 'color', default: '' },
  stroke: { label: 'Stroke', type: 'color', default: '' },
  'stroke-width': { label: 'Stroke Width', type: 'text', default: '' },
  'stroke-dasharray': { label: 'Stroke Dash', type: 'text', default: '' },
  color: { label: 'Text Color', type: 'color', default: '' },
  'font-size': { label: 'Font Size', type: 'text', default: '' },
  'font-weight': { label: 'Font Weight', type: 'select', options: ['', 'normal', 'bold', 'bolder', 'lighter'], default: '' },
  'font-style': { label: 'Font Style', type: 'select', options: ['', 'normal', 'italic', 'oblique'], default: '' },
  rx: { label: 'Corner Radius', type: 'text', default: '' },
  ry: { label: 'Corner Radius Y', type: 'text', default: '' },
  opacity: { label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.05, default: '' },
}

const STYLE_PROPS_LIST = Object.entries(STYLE_PROPS).map(([key, val]) => ({ key, ...val }))

const DEFAULT_CLASS_STYLE = 'fill:#6366f1,stroke:#4f46e5,color:#fff'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseStyleString(styleStr) {
  const result = {}
  if (!styleStr) return result
  const props = styleStr.split(',')
  for (const prop of props) {
    const trimmed = prop.trim()
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue
    const key = trimmed.slice(0, colonIdx).trim()
    const value = trimmed.slice(colonIdx + 1).trim()
    if (key && value) result[key] = value
  }
  return result
}

function styleObjectToString(styleObj) {
  return Object.entries(styleObj)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${v}`)
    .join(',')
}

function parseClassDefs(code) {
  const classDefs = {}
  const regex = /^\s*classDef\s+(\w[\w-]*)\s+(.+?)(?:\n|$)/g
  let match
  while ((match = regex.exec(code)) !== null) {
    const name = match[1]
    const styles = parseStyleString(match[2])
    classDefs[name] = styles
  }
  return classDefs
}

function parseClassAssignments(code) {
  const assignments = {}
  const regex = /^\s*class\s+(.+?)\s+([\w][\w\s,-]*?)$/gm
  let match
  while ((match = regex.exec(code)) !== null) {
    const nodeIds = match[1].split(',').map(s => s.trim())
    const className = match[2].trim()
    for (const id of nodeIds) {
      if (id) assignments[id] = className
    }
  }
  return assignments
}

function parseInlineStyles(code) {
  const styles = {}
  const regex = /^\s*style\s+(\w[\w-]*)\s+(.+?)(?:\n|$)/gm
  let match
  while ((match = regex.exec(code)) !== null) {
    const nodeId = match[1]
    const styleObj = parseStyleString(match[2])
    styles[nodeId] = styleObj
  }
  return styles
}

function getNodeStyles(code, nodeId) {
  const classAssignments = parseClassAssignments(code)
  const classDefs = parseClassDefs(code)
  const inlineStyles = parseInlineStyles(code)

  let merged = {}

  const className = classAssignments[nodeId]
  if (className && classDefs[className]) {
    merged = { ...classDefs[className] }
  }

  if (inlineStyles[nodeId]) {
    merged = { ...merged, ...inlineStyles[nodeId] }
  }

  return merged
}

function applyStyleToCode(code, nodeId, styleObj) {
  const lines = code.split('\n')
  const newLines = []
  let styleRemoved = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith(`style ${nodeId} `)) {
      const str = styleObjectToString(styleObj)
      if (str) {
        newLines.push(`style ${nodeId} ${str}`)
      }
      styleRemoved = true
    } else {
      newLines.push(line)
    }
  }

  if (!styleRemoved) {
    const str = styleObjectToString(styleObj)
    if (str) {
      newLines.push(`style ${nodeId} ${str}`)
    }
  }

  return newLines.join('\n')
}

function applyClassDefToCode(code, className, styleObj) {
  const lines = code.split('\n')
  const newLines = []
  let found = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith(`classDef ${className} `)) {
      const str = styleObjectToString(styleObj)
      if (str) {
        newLines.push(`classDef ${className} ${str}`)
      }
      found = true
    } else {
      newLines.push(line)
    }
  }

  if (!found) {
    const str = styleObjectToString(styleObj)
    if (str) {
      newLines.push(`classDef ${className} ${str}`)
    }
  }

  return newLines.join('\n')
}

function applyClassAssignmentToCode(code, nodeIds, className) {
  const lines = code.split('\n')
  const newLines = []
  const escapedIds = nodeIds.map(escapeRegex)
  const pattern = new RegExp(`^class\\s+.*\\b(${escapedIds.join('|')})\\b`)

  let removed = false
  for (const line of lines) {
    if (!removed && pattern.test(line.trim())) {
      removed = true
    } else {
      newLines.push(line)
    }
  }

  if (nodeIds.length && className) {
    newLines.push(`class ${nodeIds.join(',')} ${className}`)
  }

  return newLines.join('\n')
}

function removeStyleFromCode(code, nodeId) {
  const lines = code.split('\n')
  return lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.startsWith(`style ${nodeId} `)
  }).join('\n')
}

function removeClassDef(code, className) {
  const lines = code.split('\n')
  return lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.startsWith(`classDef ${className} `)
  }).join('\n')
}

function removeClassAssignment(code, nodeId) {
  const escaped = escapeRegex(nodeId)
  const lines = code.split('\n')
  return lines.filter(line => {
    const trimmed = line.trim()
    return !new RegExp(`^class\\s+.*\\b${escaped}\\b`).test(trimmed)
  }).join('\n')
}

function parseLinkStyles(code) {
  const styles = {}
  const regex = /^\s*linkStyle\s+(\d+)\s+(.+?)(?:\n|$)/gm
  let match
  while ((match = regex.exec(code)) !== null) {
    const index = parseInt(match[1])
    const styleObj = parseStyleString(match[2])
    styles[index] = styleObj
  }
  return styles
}

function applyLinkStyle(code, edgeIndex, styleObj) {
  const lines = code.split('\n')
  const newLines = []
  let styleRemoved = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith(`linkStyle ${edgeIndex} `)) {
      const str = styleObjectToString(styleObj)
      if (str) {
        newLines.push(`linkStyle ${edgeIndex} ${str}`)
      }
      styleRemoved = true
    } else {
      newLines.push(line)
    }
  }

  if (!styleRemoved) {
    const str = styleObjectToString(styleObj)
    if (str) {
      newLines.push(`linkStyle ${edgeIndex} ${str}`)
    }
  }

  return newLines.join('\n')
}

function removeLinkStyle(code, edgeIndex) {
  const lines = code.split('\n')
  return lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.startsWith(`linkStyle ${edgeIndex} `)
  }).join('\n')
}

function extractEdgeIndex(code, fromId, toId) {
  const lines = code.split('\n')
  let edgeIndex = 0
  const SKIP_PREFIXES = ['%%', 'subgraph ', 'style ', 'linkStyle ', 'classDef ', 'class ', 'click ', 'participant ', 'actor ', 'note ']

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === 'end' || SKIP_PREFIXES.some(p => trimmed.startsWith(p))) continue

    const segmentRe = /([\w-]+)\s*(-->|---|-\.->|-.->|==>|--\s*\|[^|]*\||-\.->\s*\|[^|]*\||==>\s*\|[^|]*\|)/g
    let m
    while ((m = segmentRe.exec(trimmed)) !== null) {
      const from = m[1]
      const arrowEnd = segmentRe.lastIndex
      const afterArrow = trimmed.slice(arrowEnd)
      const labelMatch = afterArrow.match(/^\s*\|[^|]*\|\s*([\w-]+)/)
      const toNode = labelMatch ? labelMatch[1] : afterArrow.match(/^\s*([\w-]+)/)?.[1]

      if (from === fromId && toNode === toId) {
        return edgeIndex
      }
      edgeIndex++

      if (labelMatch) {
        segmentRe.lastIndex = trimmed.indexOf(labelMatch[0], arrowEnd - afterArrow.length) + labelMatch[0].length
      }
    }
  }
  return -1
}

function extractEdges(code) {
  const edges = []
  const lines = code.split('\n')
  const SKIP_PREFIXES = ['%%', 'subgraph ', 'style ', 'linkStyle ', 'classDef ', 'class ', 'click ', 'participant ', 'actor ', 'note ']

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === 'end' || SKIP_PREFIXES.some(p => trimmed.startsWith(p))) continue

    const segmentRe = /([\w-]+)\s*(-->|---|-\.->|-.->|==>|--\s*\|[^|]*\||-\.->\s*\|[^|]*\||==>\s*\|[^|]*\|)/g
    let m
    while ((m = segmentRe.exec(trimmed)) !== null) {
      const from = m[1]
      const arrowEnd = segmentRe.lastIndex
      const afterArrow = trimmed.slice(arrowEnd)
      const labelMatch = afterArrow.match(/^\s*\|([^|]*)\|\s*([\w-]+)/)
      const label = labelMatch ? labelMatch[1] : null
      const toNode = labelMatch ? labelMatch[2] : afterArrow.match(/^\s*([\w-]+)/)?.[1]
      if (toNode) edges.push({ from, to: toNode, label })

      if (labelMatch) {
        segmentRe.lastIndex = trimmed.indexOf(labelMatch[0], arrowEnd - afterArrow.length) + labelMatch[0].length
      }
    }
  }
  return edges
}

export {
  STYLE_PROPS,
  STYLE_PROPS_LIST,
  DEFAULT_CLASS_STYLE,
  escapeRegex,
  parseStyleString,
  styleObjectToString,
  parseClassDefs,
  parseClassAssignments,
  parseInlineStyles,
  getNodeStyles,
  applyStyleToCode,
  applyClassDefToCode,
  applyClassAssignmentToCode,
  removeStyleFromCode,
  removeClassDef,
  removeClassAssignment,
  parseLinkStyles,
  applyLinkStyle,
  removeLinkStyle,
  extractEdgeIndex,
  extractEdges,
}
