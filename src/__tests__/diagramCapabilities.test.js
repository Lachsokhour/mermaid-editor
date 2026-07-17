import { describe, it, expect } from 'vitest'
import DIAGRAMS, { DIAGRAM_CAPABILITIES } from '../data/diagrams'

describe('DIAGRAM_CAPABILITIES covers all diagram types', () => {
  it('has an entry for every diagram in DIAGRAMS', () => {
    const missing = DIAGRAMS.filter(d => !(d.id in DIAGRAM_CAPABILITIES))
    expect(missing).toEqual([])
  })

  it('has exactly the right keys (no extras)', () => {
    const diagramIds = new Set(DIAGRAMS.map(d => d.id))
    const extraKeys = Object.keys(DIAGRAM_CAPABILITIES).filter(k => !diagramIds.has(k))
    expect(extraKeys).toEqual([])
  })

  it('every diagram has exactly nodeStyle, edgeStyle, classDef, clusters', () => {
    const expectedKeys = ['nodeStyle', 'edgeStyle', 'classDef', 'clusters'].sort()
    for (const [id, caps] of Object.entries(DIAGRAM_CAPABILITIES)) {
      expect(Object.keys(caps).sort()).toEqual(expectedKeys)
      for (const key of expectedKeys) {
        expect(typeof caps[key]).toBe('boolean')
      }
    }
  })
})

describe('capabilities are correct per diagram type', () => {
  // Diagrams that support node styling (inline style / classDef)
  const nodeStyleDiagrams = [
    'flowchart', 'class', 'state', 'entity-relationship', 'sequence',
    'mindmap', 'timeline', 'user-journey', 'requirement',
    'architecture', 'block', 'c4', 'treeview', 'treemap', 'venn',
  ]
  const noNodeStyleDiagrams = [
    'gantt', 'kanban', 'git', 'ishikawa', 'packet', 'pie',
    'quadrant', 'radar', 'sankey', 'info', 'eventmodeling',
  ]

  it.each(nodeStyleDiagrams)('%s supports node styling', (id) => {
    expect(DIAGRAM_CAPABILITIES[id].nodeStyle).toBe(true)
  })

  it.each(noNodeStyleDiagrams)('%s does NOT support node styling', (id) => {
    expect(DIAGRAM_CAPABILITIES[id].nodeStyle).toBe(false)
  })

  // Only flowchart and venn support edge styling (linkStyle)
  const edgeStyleDiagrams = ['flowchart', 'venn']
  const noEdgeStyleDiagrams = [
    'class', 'state', 'entity-relationship', 'sequence', 'mindmap',
    'gantt', 'kanban', 'timeline', 'user-journey', 'requirement',
    'architecture', 'block', 'c4', 'git', 'ishikawa', 'packet', 'pie',
    'quadrant', 'radar', 'sankey', 'treeview', 'treemap', 'info', 'eventmodeling',
  ]

  it.each(edgeStyleDiagrams)('%s supports edge styling', (id) => {
    expect(DIAGRAM_CAPABILITIES[id].edgeStyle).toBe(true)
  })

  it.each(noEdgeStyleDiagrams)('%s does NOT support edge styling', (id) => {
    expect(DIAGRAM_CAPABILITIES[id].edgeStyle).toBe(false)
  })

  // Only flowchart, class, state, entity-relationship, venn support classDef
  const classDefDiagrams = ['flowchart', 'class', 'state', 'entity-relationship', 'venn']

  it.each(classDefDiagrams)('%s supports classDef', (id) => {
    expect(DIAGRAM_CAPABILITIES[id].classDef).toBe(true)
  })

  // Only flowchart, state support clusters (subgraph)
  const clusterDiagrams = ['flowchart', 'state']

  it.each(clusterDiagrams)('%s supports clusters', (id) => {
    expect(DIAGRAM_CAPABILITIES[id].clusters).toBe(true)
  })
})
