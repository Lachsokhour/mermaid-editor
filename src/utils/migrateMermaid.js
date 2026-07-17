function quoteBracketParens(line) {
  const trimmed = line.trim()
  if (trimmed.startsWith('%%') || trimmed.startsWith('style ') || trimmed.startsWith('linkStyle ') || trimmed.startsWith('classDef ') || trimmed.startsWith('class ') || trimmed.startsWith('click ')) {
    return line
  }
  return line.replace(/\[([^\]"]*)\]/g, (fullMatch, inner) => {
    if (inner.includes('(') || inner.includes(')')) {
      return '["' + inner + '"]'
    }
    return fullMatch
  })
}

function sanitizeFlowchartParens(code) {
  return code.split('\n').map(line => quoteBracketParens(line)).join('\n')
}

function moveLinkStylesToEnd(code) {
  const lines = code.split('\n')
  const linkStyleLines = []
  const otherLines = []
  for (const line of lines) {
    if (/^\s*linkStyle\s+/.test(line)) {
      linkStyleLines.push(line)
    } else {
      otherLines.push(line)
    }
  }
  if (linkStyleLines.length === 0) return code
  while (otherLines.length && otherLines[otherLines.length - 1].trim() === '') {
    otherLines.pop()
  }
  return otherLines.join('\n') + '\n' + linkStyleLines.join('\n')
}

function migrateMermaidCode(code) {
  let result = sanitizeFlowchartParens(code)
  result = moveLinkStylesToEnd(result)
  return result
}

export { sanitizeFlowchartParens, moveLinkStylesToEnd, migrateMermaidCode }
