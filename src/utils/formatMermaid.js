const ARROW = /--[>ox]|==[>ox]|-\.->|===|<--|<-\.-|<===|<==|<--|<-=/
const BLOCK_START = /subgraph\b/i
const BLOCK_END = /^end\b/i

function normalizeArrows(line) {
  let result = ''
  let i = 0
  while (i < line.length) {
    const sub = line.slice(i)
    let arrow = sub.match(ARROW)
    if (arrow && arrow.index === 0) {
      const a = arrow[0]
      if (i > 0 && line[i - 1] !== ' ') {
        result += ' '
      }
      result += a
      i += a.length
      if (i < line.length && line[i] !== ' ' && line[i] !== '|' && line[i] !== ')' && line[i] !== ']' && line[i] !== '}') {
        result += ' '
      }
      continue
    }
    if (line[i] === '[' || line[i] === '{' || line[i] === '(') {
      const close = line[i] === '[' ? ']' : line[i] === '{' ? '}' : ')'
      const j = line.indexOf(close, i + 1)
      if (j !== -1) {
        result += line.slice(i, j + 1)
        i = j + 1
        continue
      }
    }
    result += line[i]
    i++
  }
  return result
}

export function formatMermaid(code) {
  const lines = code.split('\n')
  let indentLevel = 0
  const result = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    if (line === '') {
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('')
      }
      continue
    }

    if (BLOCK_END.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    line = normalizeArrows(line)

    const indent = '  '.repeat(indentLevel)
    result.push(indent + line)

    if (BLOCK_START.test(line) && !/end\s*$/i.test(line)) {
      indentLevel++
    }
  }

  while (result.length > 0 && result[result.length - 1] === '') {
    result.pop()
  }

  return result.join('\n') + '\n'
}
