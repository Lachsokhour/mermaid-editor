import { describe, it, expect } from 'vitest'
import {
  extractNodeId,
  CLICK_SELECTORS,
  EDGE_CLASSES,
  NODE_CLASSES,
} from '../utils/svgInspector'

describe('CLICK_SELECTORS', () => {
  const selectors = CLICK_SELECTORS

  it('covers node types', () => {
    expect(selectors).toContain('g[data-id]')
    expect(selectors).toContain('g.node')
    expect(selectors).toContain('g.actor')
    expect(selectors).toContain('g.rect')
    expect(selectors).toContain('g.circle')
    expect(selectors).toContain('g.cluster')
  })

  it('covers edge types', () => {
    expect(selectors).toContain('g.edgePath')
    expect(selectors).toContain('g.edge')
    expect(selectors).toContain('g.messageLine')
    expect(selectors).toContain('g.line')
  })

  it('covers sequence diagram flow controls', () => {
    expect(selectors).toContain('g.loop')
    expect(selectors).toContain('g.alt')
    expect(selectors).toContain('g.opt')
    expect(selectors).toContain('g.par')
  })
})

describe('EDGE_CLASSES', () => {
  it('contains edge-related class names', () => {
    expect(EDGE_CLASSES.has('edgePath')).toBe(true)
    expect(EDGE_CLASSES.has('edge')).toBe(true)
    expect(EDGE_CLASSES.has('messageLine')).toBe(true)
    expect(EDGE_CLASSES.has('line')).toBe(true)
  })

  it('does not contain node class names', () => {
    expect(EDGE_CLASSES.has('node')).toBe(false)
    expect(EDGE_CLASSES.has('actor')).toBe(false)
    expect(EDGE_CLASSES.has('rect')).toBe(false)
  })
})

describe('NODE_CLASSES', () => {
  it('contains node-related class names', () => {
    expect(NODE_CLASSES.has('node')).toBe(true)
    expect(NODE_CLASSES.has('actor')).toBe(true)
    expect(NODE_CLASSES.has('rect')).toBe(true)
    expect(NODE_CLASSES.has('circle')).toBe(true)
    expect(NODE_CLASSES.has('cluster')).toBe(true)
  })

  it('does not contain edge class names', () => {
    expect(NODE_CLASSES.has('edgePath')).toBe(false)
    expect(NODE_CLASSES.has('edge')).toBe(false)
    expect(NODE_CLASSES.has('messageLine')).toBe(false)
  })
})

describe('extractNodeId', () => {
  it('strips mermaid render prefix', () => {
    expect(extractNodeId('mermaid-render-0-flowchart-A-0')).toBe('A')
  })

  it('strips diagram type prefix', () => {
    expect(extractNodeId('mermaid-render-0-sequence-Alice-0')).toBe('Alice')
    expect(extractNodeId('mermaid-render-0-classDiagram-Animal-0')).toBe('Animal')
    expect(extractNodeId('mermaid-render-0-stateDiagram-Still-0')).toBe('Still')
    expect(extractNodeId('mermaid-render-0-erDiagram-CUSTOMER-0')).toBe('CUSTOMER')
    expect(extractNodeId('mermaid-render-0-gitGraph-commit-0')).toBe('commit')
  })

  it('strips internal prefixes', () => {
    expect(extractNodeId('mermaid-render-0-classDiagram-classId-Animal-0')).toBe('Animal')
    expect(extractNodeId('mermaid-render-0-stateDiagram-stateId-Still-0')).toBe('Still')
    expect(extractNodeId('mermaid-render-0-erDiagram-er-CUSTOMER-0')).toBe('CUSTOMER')
    expect(extractNodeId('mermaid-render-0-sequence-actorId-Alice-0')).toBe('Alice')
    expect(extractNodeId('mermaid-render-0-sequence-actor2-Bob-0')).toBe('Bob')
    expect(extractNodeId('mermaid-render-0-sequence-nodeId-Note-0')).toBe('Note')
  })

  it('strips state- prefix from stateDiagram SVG data-id', () => {
    expect(extractNodeId('mermaid-render-1-state-Still-0')).toBe('Still')
    expect(extractNodeId('mermaid-render-1-state-Moving-0')).toBe('Moving')
    expect(extractNodeId('mermaid-render-1-state-Crash-0')).toBe('Crash')
  })

  it('strips state- prefix with multi-digit indices', () => {
    expect(extractNodeId('mermaid-render-12-state-Running-10')).toBe('Running')
  })

  it('strips trailing digit suffix', () => {
    expect(extractNodeId('mermaid-render-0-flowchart-A-0')).toBe('A')
    expect(extractNodeId('mermaid-render-0-flowchart-B-1')).toBe('B')
  })

  it('returns empty string for empty input', () => {
    expect(extractNodeId('')).toBe('')
    expect(extractNodeId(null)).toBe('')
    expect(extractNodeId(undefined)).toBe('')
  })

  it('handles data-id without render prefix', () => {
    expect(extractNodeId('flowchart-A-0')).toBe('A')
  })

  it('handles simple IDs', () => {
    expect(extractNodeId('mermaid-render-0-flowchart-Start-0')).toBe('Start')
  })
})
