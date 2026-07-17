import { describe, it, expect } from 'vitest'
import {
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
} from '../utils/styleParser'

describe('parseStyleString', () => {
  it('parses a comma-separated style string', () => {
    expect(parseStyleString('fill:#6366f1,stroke:#4f46e5,color:#fff')).toEqual({
      fill: '#6366f1',
      stroke: '#4f46e5',
      color: '#fff',
    })
  })

  it('handles spaces around values', () => {
    expect(parseStyleString('fill: #6366f1, stroke: #4f46e5')).toEqual({
      fill: '#6366f1',
      stroke: '#4f46e5',
    })
  })

  it('returns empty object for empty input', () => {
    expect(parseStyleString('')).toEqual({})
    expect(parseStyleString(null)).toEqual({})
  })

  it('skips invalid entries without colon', () => {
    expect(parseStyleString('fill:#6366f1,invalid,stroke:#000')).toEqual({
      fill: '#6366f1',
      stroke: '#000',
    })
  })

  it('handles stroke-width and stroke-dasharray', () => {
    expect(parseStyleString('stroke-width:2px,stroke-dasharray:8 4')).toEqual({
      'stroke-width': '2px',
      'stroke-dasharray': '8 4',
    })
  })
})

describe('styleObjectToString', () => {
  it('converts an object to style string', () => {
    expect(styleObjectToString({ fill: '#6366f1', stroke: '#4f46e5' }))
      .toBe('fill:#6366f1,stroke:#4f46e5')
  })

  it('filters out empty/undefined/null values', () => {
    expect(styleObjectToString({ fill: '#6366f1', stroke: '', color: null, opacity: undefined }))
      .toBe('fill:#6366f1')
  })

  it('returns empty string for empty object', () => {
    expect(styleObjectToString({})).toBe('')
  })
})

describe('parseClassDefs', () => {
  it('parses classDef lines', () => {
    const code = `classDiagram
  classDef highlight fill:#6366f1,stroke:#4f46e5,color:#fff
  classDef danger fill:#ef4444,stroke:#dc2626`
    const defs = parseClassDefs(code)
    expect(defs.highlight).toEqual({ fill: '#6366f1', stroke: '#4f46e5', color: '#fff' })
    expect(defs.danger).toEqual({ fill: '#ef4444', stroke: '#dc2626' })
  })

  it('returns empty object when no classDef found', () => {
    expect(parseClassDefs('graph TD\n  A-->B')).toEqual({})
  })

  it('handles classDef with hyphens in name', () => {
    const code = 'classDef my-class fill:#000'
    expect(parseClassDefs(code)['my-class']).toEqual({ fill: '#000' })
  })
})

describe('parseClassAssignments', () => {
  it('parses class assignment lines', () => {
    const code = `class A,B highlight
  class C danger`
    const assignments = parseClassAssignments(code)
    expect(assignments.A).toBe('highlight')
    expect(assignments.B).toBe('highlight')
    expect(assignments.C).toBe('danger')
  })

  it('returns empty object when no assignments found', () => {
    expect(parseClassAssignments('graph TD\n  A-->B')).toEqual({})
  })
})

describe('parseInlineStyles', () => {
  it('parses style lines', () => {
    const code = `graph TD
  A[Node] --> B[Node]
  style A fill:#6366f1,stroke:#4f46e5
  style B fill:#ef4444`
    const styles = parseInlineStyles(code)
    expect(styles.A).toEqual({ fill: '#6366f1', stroke: '#4f46e5' })
    expect(styles.B).toEqual({ fill: '#ef4444' })
  })

  it('returns empty object when no styles found', () => {
    expect(parseInlineStyles('graph TD\n  A-->B')).toEqual({})
  })
})

describe('getNodeStyles', () => {
  it('returns inline style for a node', () => {
    const code = `graph TD
  A[Node] --> B[Node]
  style A fill:#6366f1`
    expect(getNodeStyles(code, 'A')).toEqual({ fill: '#6366f1' })
  })

  it('merges classDef + class assignment', () => {
    const code = `classDiagram
  classDef highlight fill:#6366f1,stroke:#4f46e5
  class Animal highlight`
    expect(getNodeStyles(code, 'Animal')).toEqual({ fill: '#6366f1', stroke: '#4f46e5' })
  })

  it('inline style overrides classDef', () => {
    const code = `classDiagram
  classDef highlight fill:#6366f1,stroke:#4f46e5
  class Animal highlight
  style Animal fill:#ef4444`
    expect(getNodeStyles(code, 'Animal')).toEqual({ fill: '#ef4444', stroke: '#4f46e5' })
  })

  it('returns empty object for unstyled node', () => {
    expect(getNodeStyles('graph TD\n  A-->B', 'A')).toEqual({})
  })
})

describe('applyStyleToCode', () => {
  it('adds a new style line', () => {
    const code = 'graph TD\n  A-->B'
    const result = applyStyleToCode(code, 'A', { fill: '#6366f1' })
    expect(result).toContain('style A fill:#6366f1')
  })

  it('replaces an existing style line', () => {
    const code = 'graph TD\n  A-->B\nstyle A fill:#000'
    const result = applyStyleToCode(code, 'A', { fill: '#6366f1' })
    expect(result).toContain('style A fill:#6366f1')
    expect(result).not.toContain('#000')
  })

  it('removes style when empty object', () => {
    const code = 'graph TD\n  A-->B\nstyle A fill:#000'
    const result = applyStyleToCode(code, 'A', {})
    expect(result).not.toContain('style A')
  })

  it('separates style from last line with newline', () => {
    const code = 'graph TD\n  A-->B'
    const result = applyStyleToCode(code, 'A', { fill: '#6366f1' })
    const lines = result.split('\n')
    expect(lines[lines.length - 1]).toMatch(/^style/)
    expect(lines[lines.length - 2]).not.toMatch(/style/)
  })

  it('does not concatenate style onto last line of stateDiagram', () => {
    const code = `stateDiagram-v2
  [*] --> Still
  Still --> [*]
  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]`
    const result = applyStyleToCode(code, 'state-Still', { fill: '#ec4899', stroke: '#db2777', color: '#ffffff' })
    const lines = result.split('\n')
    expect(lines[lines.length - 1]).toBe('style state-Still fill:#ec4899,stroke:#db2777,color:#ffffff')
    expect(lines[lines.length - 2]).toBe('  Crash --> [*]')
    expect(result).not.toMatch(/\]\]style/)
  })

  it('does not concatenate style onto last line when code ends with newline', () => {
    const code = `stateDiagram-v2
  [*] --> Still
  Still --> [*]
  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]
`
    const result = applyStyleToCode(code, 'state-Still', { fill: '#ec4899' })
    expect(result).not.toMatch(/\]\]style/)
    expect(result).toContain('\nstyle state-Still')
  })

  it('adds style correctly after multiple existing styles', () => {
    const code = `stateDiagram-v2
  [*] --> Still
  Still --> Moving
style state-Still fill:#000`
    const result = applyStyleToCode(code, 'state-Moving', { fill: '#ec4899' })
    expect(result).not.toMatch(/#000style/)
    expect(result).toContain('style state-Moving fill:#ec4899')
  })

  it('handles code with Windows-style line endings', () => {
    const code = 'graph TD\r\n  A-->B'
    const result = applyStyleToCode(code, 'A', { fill: '#6366f1' })
    expect(result).not.toContain('Bstyle')
    expect(result).toContain('style A fill:#6366f1')
  })

  it('stateDiagram: style line is always on its own line regardless of node ID format', () => {
    const code = `stateDiagram-v2\r\n  [*] --> Still\r\n  Still --> Moving\r\n  Moving --> Crash\r\n  Crash --> [*]`
    const result = applyStyleToCode(code, 'state-Still', { fill: '#ec4899', stroke: '#db2777', color: '#ffffff' })
    const lastLine = result.trim().split(/\r?\n/).pop()
    expect(lastLine).toBe('style state-Still fill:#ec4899,stroke:#db2777,color:#ffffff')
    expect(result).not.toMatch(/\]\]style/)
  })
})

describe('applyClassDefToCode', () => {
  it('adds a new classDef line', () => {
    const code = 'classDiagram\n  class Animal'
    const result = applyClassDefToCode(code, 'highlight', { fill: '#6366f1' })
    expect(result).toContain('classDef highlight fill:#6366f1')
  })

  it('replaces an existing classDef line', () => {
    const code = 'classDiagram\nclassDef highlight fill:#000'
    const result = applyClassDefToCode(code, 'highlight', { fill: '#6366f1' })
    expect(result).toContain('classDef highlight fill:#6366f1')
    expect(result).not.toContain('#000')
  })
})

describe('applyClassAssignmentToCode', () => {
  it('adds a new class assignment', () => {
    const code = 'graph TD\n  A-->B'
    const result = applyClassAssignmentToCode(code, ['A', 'B'], 'highlight')
    expect(result).toContain('class A,B highlight')
  })

  it('replaces existing class assignment', () => {
    const code = 'graph TD\n  A-->B\nclass A oldClass'
    const result = applyClassAssignmentToCode(code, ['A'], 'newClass')
    expect(result).toContain('class A newClass')
    expect(result).not.toContain('oldClass')
  })
})

describe('removeStyleFromCode', () => {
  it('removes style line for a node', () => {
    const code = 'graph TD\n  A-->B\nstyle A fill:#6366f1'
    const result = removeStyleFromCode(code, 'A')
    expect(result).not.toContain('style A')
  })

  it('does not remove other nodes styles', () => {
    const code = 'graph TD\n  A-->B\nstyle A fill:#6366f1\nstyle B fill:#000'
    const result = removeStyleFromCode(code, 'A')
    expect(result).toContain('style B')
  })
})

describe('removeClassDef', () => {
  it('removes classDef line', () => {
    const code = 'classDiagram\nclassDef highlight fill:#6366f1'
    const result = removeClassDef(code, 'highlight')
    expect(result).not.toContain('classDef highlight')
  })
})

describe('removeClassAssignment', () => {
  it('removes class assignment for a node', () => {
    const code = 'classDiagram\nclass Animal highlight'
    const result = removeClassAssignment(code, 'Animal')
    expect(result).not.toContain('class Animal')
  })
})

describe('parseLinkStyles', () => {
  it('parses linkStyle lines', () => {
    const code = `graph TD
  A-->B
  B-->C
  linkStyle 0 stroke:#3b82f6,stroke-width:2px
  linkStyle 1 stroke:#10b981,stroke-dasharray: 5 5`
    const styles = parseLinkStyles(code)
    expect(styles[0]).toEqual({ stroke: '#3b82f6', 'stroke-width': '2px' })
    expect(styles[1]).toEqual({ stroke: '#10b981', 'stroke-dasharray': '5 5' })
  })

  it('returns empty object when no linkStyles found', () => {
    expect(parseLinkStyles('graph TD\n  A-->B')).toEqual({})
  })
})

describe('applyLinkStyle', () => {
  it('adds a new linkStyle line', () => {
    const code = 'graph TD\n  A-->B'
    const result = applyLinkStyle(code, 0, { stroke: '#3b82f6' })
    expect(result).toContain('linkStyle 0 stroke:#3b82f6')
  })

  it('replaces existing linkStyle', () => {
    const code = 'graph TD\n  A-->B\nlinkStyle 0 stroke:#000'
    const result = applyLinkStyle(code, 0, { stroke: '#3b82f6' })
    expect(result).toContain('linkStyle 0 stroke:#3b82f6')
    expect(result).not.toContain('#000')
  })

  it('removes linkStyle when empty', () => {
    const code = 'graph TD\n  A-->B\nlinkStyle 0 stroke:#000'
    const result = applyLinkStyle(code, 0, {})
    expect(result).not.toContain('linkStyle 0')
  })
})

describe('removeLinkStyle', () => {
  it('removes a specific linkStyle line', () => {
    const code = 'graph TD\n  A-->B\n  B-->C\nlinkStyle 0 stroke:#000\nlinkStyle 1 stroke:#fff'
    const result = removeLinkStyle(code, 0)
    expect(result).not.toContain('linkStyle 0')
    expect(result).toContain('linkStyle 1')
  })
})

describe('extractEdgeIndex', () => {
  it('finds simple edge A-->B at index 0', () => {
    const code = 'graph TD\n  A --> B'
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
  })

  it('finds second edge at index 1', () => {
    const code = `graph TD
  A --> B
  B --> C`
    expect(extractEdgeIndex(code, 'B', 'C')).toBe(1)
  })

  it('counts chained edges A-->B-->C as indices 0 and 1', () => {
    const code = 'graph TD\n  A --> B --> C'
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
    expect(extractEdgeIndex(code, 'B', 'C')).toBe(1)
  })

  it('counts complex chained edges A-->B-->C-->D-->E as indices 0-3', () => {
    const code = 'graph TD\n  A --> B --> C --> D --> E'
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
    expect(extractEdgeIndex(code, 'B', 'C')).toBe(1)
    expect(extractEdgeIndex(code, 'C', 'D')).toBe(2)
    expect(extractEdgeIndex(code, 'D', 'E')).toBe(3)
  })

  it('skips style and classDef lines', () => {
    const code = `graph TD
  A --> B
  style A fill:#000
  classDef highlight fill:#6366f1
  B --> C`
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
    expect(extractEdgeIndex(code, 'B', 'C')).toBe(1)
  })

  it('skips comment lines', () => {
    const code = `graph TD
  %% this is a comment
  A --> B`
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
  })

  it('skips linkStyle lines', () => {
    const code = `graph TD
  A --> B
  linkStyle 0 stroke:#000
  B --> C`
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
    expect(extractEdgeIndex(code, 'B', 'C')).toBe(1)
  })

  it('handles labeled edges', () => {
    const code = 'graph TD\n  A -->|Yes| B\n  A -->|No| C'
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
    expect(extractEdgeIndex(code, 'A', 'C')).toBe(1)
  })

  it('returns -1 when edge not found', () => {
    const code = 'graph TD\n  A --> B'
    expect(extractEdgeIndex(code, 'X', 'Y')).toBe(-1)
  })

  it('skips subgraph lines', () => {
    const code = `graph TD
  subgraph Group
    A --> B
  end
  B --> C`
    expect(extractEdgeIndex(code, 'B', 'C')).toBe(1)
  })

  it('handles multiple edge types', () => {
    const code = `graph TD
  A --> B
  C --- D
  E -.-> F
  G ==> H`
    expect(extractEdgeIndex(code, 'A', 'B')).toBe(0)
    expect(extractEdgeIndex(code, 'C', 'D')).toBe(1)
    expect(extractEdgeIndex(code, 'E', 'F')).toBe(2)
    expect(extractEdgeIndex(code, 'G', 'H')).toBe(3)
  })
})

describe('extractEdges', () => {
  it('extracts all edges from a simple graph', () => {
    const code = 'graph TD\n  A --> B\n  B --> C'
    const edges = extractEdges(code)
    expect(edges).toEqual([
      { from: 'A', to: 'B', label: null },
      { from: 'B', to: 'C', label: null },
    ])
  })

  it('extracts labeled edges', () => {
    const code = 'graph TD\n  A -->|Yes| B\n  A -->|No| C'
    const edges = extractEdges(code)
    expect(edges).toEqual([
      { from: 'A', to: 'B', label: 'Yes' },
      { from: 'A', to: 'C', label: 'No' },
    ])
  })

  it('extracts chained edges correctly', () => {
    const code = 'graph TD\n  A --> B --> C --> D'
    const edges = extractEdges(code)
    expect(edges).toHaveLength(3)
    expect(edges[0]).toEqual({ from: 'A', to: 'B', label: null })
    expect(edges[1]).toEqual({ from: 'B', to: 'C', label: null })
    expect(edges[2]).toEqual({ from: 'C', to: 'D', label: null })
  })

  it('extracts complex chained edges', () => {
    const code = 'graph TD\n  A --> B --> C --> D --> E'
    const edges = extractEdges(code)
    expect(edges).toHaveLength(4)
    expect(edges[3]).toEqual({ from: 'D', to: 'E', label: null })
  })

  it('skips style, classDef, and comment lines', () => {
    const code = `graph TD
  %% comment
  A --> B
  style A fill:#000
  classDef highlight fill:#6366f1
  B --> C`
    const edges = extractEdges(code)
    expect(edges).toHaveLength(2)
  })

  it('skips linkStyle lines', () => {
    const code = `graph TD
  A --> B
  linkStyle 0 stroke:#000
  B --> C`
    const edges = extractEdges(code)
    expect(edges).toHaveLength(2)
  })

  it('handles various arrow types', () => {
    const code = `graph TD
  A --> B
  C --- D
  E -.-> F
  G ==> H`
    const edges = extractEdges(code)
    expect(edges).toHaveLength(4)
    expect(edges[0].from).toBe('A')
    expect(edges[1].from).toBe('C')
    expect(edges[2].from).toBe('E')
    expect(edges[3].from).toBe('G')
  })

  it('returns empty array for no edges', () => {
    expect(extractEdges('graph TD\n  A[Start]')).toEqual([])
  })
})

describe('roundtrip: apply style → parse → verify', () => {
  it('node style roundtrip', () => {
    const code = 'graph TD\n  A-->B'
    const styled = applyStyleToCode(code, 'A', { fill: '#6366f1', stroke: '#4f46e5', color: '#fff' })
    const parsed = parseInlineStyles(styled)
    expect(parsed.A).toEqual({ fill: '#6366f1', stroke: '#4f46e5', color: '#fff' })
    expect(getNodeStyles(styled, 'A')).toEqual({ fill: '#6366f1', stroke: '#4f46e5', color: '#fff' })
  })

  it('classDef roundtrip', () => {
    const code = 'classDiagram\n  class Animal'
    const styled = applyClassDefToCode(code, 'highlight', { fill: '#6366f1', stroke: '#4f46e5' })
    const defs = parseClassDefs(styled)
    expect(defs.highlight).toEqual({ fill: '#6366f1', stroke: '#4f46e5' })
  })

  it('linkStyle roundtrip', () => {
    const code = 'graph TD\n  A-->B'
    const styled = applyLinkStyle(code, 0, { stroke: '#3b82f6', 'stroke-width': '2px' })
    const styles = parseLinkStyles(styled)
    expect(styles[0]).toEqual({ stroke: '#3b82f6', 'stroke-width': '2px' })
  })

  it('full classDef + assignment + inline override roundtrip', () => {
    let code = 'classDiagram\n  class Animal\n  class Dog'
    code = applyClassDefToCode(code, 'highlight', { fill: '#6366f1', stroke: '#4f46e5' })
    code = applyClassAssignmentToCode(code, ['Animal', 'Dog'], 'highlight')
    code = applyStyleToCode(code, 'Dog', { fill: '#ef4444' })

    const animalStyles = getNodeStyles(code, 'Animal')
    const dogStyles = getNodeStyles(code, 'Dog')
    expect(animalStyles).toEqual({ fill: '#6366f1', stroke: '#4f46e5' })
    expect(dogStyles).toEqual({ fill: '#ef4444', stroke: '#4f46e5' })
  })
})
