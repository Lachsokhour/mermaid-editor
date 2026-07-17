/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { extractNodeId } from '../utils/svgInspector'
import { applyStyleToCode } from '../utils/styleParser'

beforeAll(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      darkMode: false,
      background: '#ffffff',
    },
  })
})

describe('extractNodeId for stateDiagram', () => {
  it('strips state- prefix from stateDiagram node data-id', () => {
    expect(extractNodeId('mermaid-render-1-state-Still-0')).toBe('Still')
  })

  it('strips state- prefix with different node names', () => {
    expect(extractNodeId('mermaid-render-1-state-Moving-0')).toBe('Moving')
    expect(extractNodeId('mermaid-render-1-state-Crash-0')).toBe('Crash')
  })

  it('strips state- prefix from multi-digit indices', () => {
    expect(extractNodeId('mermaid-render-12-state-Running-10')).toBe('Running')
  })

  it('does not strip stateId- prefix (existing behavior)', () => {
    expect(extractNodeId('mermaid-render-1-stateId-Still-0')).toBe('Still')
  })

  it('preserves existing prefix handling for other diagram types', () => {
    expect(extractNodeId('mermaid-render-1-flowchart-A-0')).toBe('A')
    expect(extractNodeId('mermaid-render-1-classId-Animal-0')).toBe('Animal')
    expect(extractNodeId('mermaid-render-1-er-CUSTOMER-0')).toBe('CUSTOMER')
  })
})

const baseCode = `stateDiagram-v2
  [*] --> Still
  Still --> [*]
  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]`

describe('applyStyleToCode with extracted stateDiagram IDs', () => {
  it('produces valid mermaid code when styling stateDiagram node', () => {
    const nodeId = extractNodeId('mermaid-render-1-state-Still-0')
    expect(nodeId).toBe('Still')

    const result = applyStyleToCode(baseCode, nodeId, {
      fill: '#ec4899',
      stroke: '#db2777',
      color: '#ffffff',
    })

    expect(result).toContain('style Still fill:#ec4899')
    expect(result).not.toMatch(/\]\]style/)
  })

  it('does not produce state- prefixed style for regular stateDiagram nodes', () => {
    const nodeId = extractNodeId('mermaid-render-1-state-Moving-0')
    const result = applyStyleToCode(baseCode, nodeId, { fill: '#3b82f6' })
    expect(result).toContain('style Moving fill:#3b82f6')
    expect(result).not.toContain('style state-Moving')
  })
})
