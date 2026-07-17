/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { migrateMermaidCode, moveLinkStylesToEnd } from '../utils/migrateMermaid'

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

  it('strips trailing blank lines before appending linkStyle', () => {
    const input = `graph TD

    A["Hello"] --> B["World"]

linkStyle 0 stroke:red`
    const result = moveLinkStylesToEnd(input)
    expect(result).toContain('A["Hello"] --> B["World"]')
    expect(result.trim().endsWith('linkStyle 0 stroke:red')).toBe(true)
  })
})

describe('migrateMermaidCode', () => {
  it('does not escape parentheses in quoted bracket labels', () => {
    const input = 'graph TD\n  A["text (parens)"] --> B["next"]'
    const result = migrateMermaidCode(input)
    expect(result).toContain('text (parens)')
    expect(result).not.toContain('&#40;')
  })

  it('does not escape parentheses in round node labels', () => {
    const input = 'graph TD\n  A("Hello (world)") --> B["Next"]'
    const result = migrateMermaidCode(input)
    expect(result).toContain('Hello (world)')
    expect(result).not.toContain('&#40;')
  })

  it('moves linkStyle but does not escape parens', () => {
    const input = `graph TD
linkStyle 0 stroke:red
  A["text (parens)"] --> B["next"]`
    const result = migrateMermaidCode(input)
    expect(result).toContain('text (parens)')
    expect(result).not.toContain('&#40;')
    expect(result.trim().endsWith('linkStyle 0 stroke:red')).toBe(true)
  })

  it('output parses correctly with quoted parens', async () => {
    const input = 'graph TD\n  A["text (parens)"] --> B["next"]'
    const result = migrateMermaidCode(input)
    expect(await canParse(result)).toBe(true)
  })

  it('Khmer diagram with parens parses correctly', async () => {
    const code = `graph TD
    A["ចាប់ផ្តើមរៀន"] --> B("ជំហានទី១")
    B --> B1["ឃ្លា (មាន ៧ព្យាង្គ)"]`
    const result = migrateMermaidCode(code)
    expect(result).toContain('ឃ្លា (មាន ៧ព្យាង្គ)')
    expect(result).not.toContain('&#40;')
    expect(await canParse(result)).toBe(true)
  })
})
