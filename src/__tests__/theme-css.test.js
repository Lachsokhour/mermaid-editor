/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { THEME_CSS_PRESETS } from '../data/stylePresets'
import { applyStyleToCode, applyLinkStyle } from '../utils/styleParser'

beforeAll(() => {
  const origGetBBox = SVGElement.prototype.getBBox
  if (!origGetBBox || origGetBBox.toString().includes('not implemented')) {
    SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 200, height: 100 })
  }
  if (!SVGSVGElement.prototype.createSVGPoint) {
    SVGSVGElement.prototype.createSVGPoint = function () {
      return { x: 0, y: 0, matrixTransform: () => ({ x: 0, y: 0 }) }
    }
  }
})

const diagram = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Fix it]
  D --> A`

describe('Theme CSS renders cleanly', () => {
  THEME_CSS_PRESETS.forEach(preset => {
    it(`${preset.name} produces valid SVG with correct node count`, async () => {
      mermaid.mermaidAPI?.globalReset?.()
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        maxTextSize: 50000,
        securityLevel: 'loose',
        fontFamily: 'Rubik',
        themeCSS: preset.css || undefined,
        themeVariables: {
          darkMode: false,
          background: '#ffffff',
          primaryColor: '#6366f1',
          secondaryColor: '#eef2ff',
          lineColor: '#495057',
          primaryBorderColor: '#ffffff',
          primaryTextColor: '#212529',
        },
      })

      const { svg } = await mermaid.render('theme-css-' + preset.id, diagram)

      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')

      const nodeGroups = svg.match(/class="node[^"]*"/g) || []
      expect(nodeGroups.length).toBeGreaterThanOrEqual(4)

      if (preset.css) {
        const styleMatch = svg.match(/<style[^>]*>[\s\S]*?<\/style>/)
        expect(styleMatch).not.toBeNull()
        expect(styleMatch[0]).toContain('!important')
      }
    })
  })
})

describe('Edge styling produces correct code', () => {
  it('applyLinkStyle generates linkStyle, not style', () => {
    const result = applyLinkStyle(diagram, 0, { stroke: '#ff0000', 'stroke-width': '2px' })
    expect(result).toContain('linkStyle 0')
    expect(result).not.toContain('style L_')
  })

  it('applyStyleToCode with real node ID works', () => {
    const result = applyStyleToCode(diagram, 'A', { fill: '#ffedd5', stroke: '#ea580c' })
    expect(result).toContain('style A')
  })

  it('applyStyleToCode with L-prefix creates phantom style (documented bug)', () => {
    const result = applyStyleToCode(diagram, 'L_D_A_0', { fill: '#10b981' })
    expect(result).toContain('style L_D_A_0')
  })
})
