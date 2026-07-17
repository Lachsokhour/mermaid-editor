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
  return moveLinkStylesToEnd(code)
}

export { moveLinkStylesToEnd, migrateMermaidCode }
