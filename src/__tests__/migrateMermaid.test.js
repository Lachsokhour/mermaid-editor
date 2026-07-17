/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { migrateMermaidCode, moveLinkStylesToEnd, sanitizeFlowchartParens } from '../utils/migrateMermaid'

beforeAll(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'Rubik',
    themeVariables: { darkMode: false, background: '#ffffff' },
  })
})

async function canParse(code) {
  try {
    await mermaid.parse(code)
    return true
  } catch {
    return false
  }
}

describe('moveLinkStylesToEnd', () => {
  it('moves linkStyle lines to end of code', () => {
    const input = `graph TD
linkStyle 0 stroke:red
    A["Hello"] --> B["World"]
linkStyle 1 stroke:blue`
    const result = moveLinkStylesToEnd(input)
    const linkStyleLines = result.split('\n').filter(l => l.trim().startsWith('linkStyle'))
    expect(linkStyleLines.length).toBe(2)
    expect(result.trim().endsWith('linkStyle 1 stroke:blue')).toBe(true)
  })

  it('does nothing when no linkStyle present', () => {
    const input = `graph TD
    A["Hello"] --> B["World"]`
    expect(moveLinkStylesToEnd(input)).toBe(input)
  })
})

describe('sanitizeFlowchartParens', () => {
  it('wraps unquoted brackets with parens in quotes', () => {
    const input = 'graph TD\n  A[text (parens)] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('A["text (parens)"]')
  })

  it('does not double-quote already quoted brackets', () => {
    const input = 'graph TD\n  A["text (parens)"] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('A["text (parens)"]')
    expect(result).not.toContain('A[""')
  })

  it('does not modify brackets without parens', () => {
    const input = 'graph TD\n  A[text] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toBe(input)
  })

  it('skips comment and style lines', () => {
    const input = 'graph TD\n  %% A[text (parens)] --> B[next]\nstyle A fill:#000'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('%%')
    expect(result).not.toContain('&#40;')
  })
})

describe('migrateMermaidCode', () => {
  it('wraps unquoted brackets with parens in quotes', () => {
    const input = 'graph TD\n  A[text (parens)] --> B[next]'
    const result = migrateMermaidCode(input)
    expect(result).toContain('A["text (parens)"]')
    expect(result).not.toContain('&#40;')
  })

  it('preserves round node labels with parens', () => {
    const input = 'graph TD\n  A("Hello (world)") --> B["Next"]'
    const result = migrateMermaidCode(input)
    expect(result).toContain('Hello (world)')
  })

  it('output parses correctly by mermaid', async () => {
    const input = 'graph TD\n  A[text (parens)] --> B[next]'
    const result = migrateMermaidCode(input)
    expect(await canParse(result)).toBe(true)
  })

  it('full Khmer diagram with parens parses correctly', async () => {
    const code = `graph TD
    A["ចាប់ផ្តើមរៀន"] --> B("ជំហានទី១")
    B --> C2[ចួនឆ្លងវគ្គ (ជើងក្អែក)៖<br>• test]
    C2 --> E1[សរសេរឃ្លាទី១ (ត្រូវតែបង្កប់ន័យ)]`
    const result = migrateMermaidCode(code)
    expect(result).toContain('C2["ចួនឆ្លងវគ្គ (ជើងក្អែក)៖')
    expect(result).toContain('E1["សរសេរឃ្លាទី១ (ត្រូវតែបង្កប់ន័យ)"]')
    expect(result).not.toContain('&#40;')
    expect(await canParse(result)).toBe(true)
  })
})
