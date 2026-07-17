function escapeLabelParens(label) {
  return label.replace(/[()]/g, ch => ch === '(' ? '&#40;' : '&#41;')
}

function sanitizeBracketLabels(line) {
  return line.replace(/\[([^\]]*)\]/g, (fullMatch, inner) => {
    if (inner.includes('(') || inner.includes(')')) {
      return '[' + escapeLabelParens(inner) + ']'
    }
    return fullMatch
  })
}

function sanitizeRoundLabels(line) {
  const match = line.match(/([\w][\w-]*)\s*\(/)
  if (!match) return line
  const nodeId = match[1]
  const startIdx = match.index + match[0].length
  let depth = 1
  let endIdx = -1
  for (let i = startIdx; i < line.length; i++) {
    if (line[i] === '(') depth++
    else if (line[i] === ')') {
      depth--
      if (depth === 0) { endIdx = i; break }
    }
  }
  if (endIdx === -1) return line
  const inner = line.slice(startIdx, endIdx)
  if (!inner.includes('(') && !inner.includes(')')) return line
  const sanitized = escapeLabelParens(inner)
  return line.slice(0, startIdx) + sanitized + line.slice(endIdx)
}

function sanitizeFlowchartParens(code) {
  return code.split('\n').map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('%%')) return line
    let result = sanitizeBracketLabels(line)
    result = sanitizeRoundLabels(result)
    return result
  }).join('\n')
}

function hasUnescapedParens(code) {
  const lines = code.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('%%')) continue
    if (/\[[^\]]*[()][^\]]*\]/.test(trimmed)) return true
  }
  return false
}

export { sanitizeFlowchartParens, hasUnescapedParens, escapeLabelParens }
