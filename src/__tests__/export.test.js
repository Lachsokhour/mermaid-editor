/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { stripForeignObjects } from '../utils/export'

const SVG_MULTILINE_FO = '<foreignObject x="-80" y="-30" width="160" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#004085;font-weight:bold"><span class="nodeLabel"><p>Line1<br/>Line2<br/>Line3</p></span></div></foreignObject>'

function createSvgWithFo(foXml) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <g transform="translate(100,50)">
      <rect x="-60" y="-25" width="120" height="50" rx="5" fill="#d4edda" stroke="#155724" stroke-width="2"/>
      ${foXml}
    </g>
    <g transform="translate(300,50)">
      <rect x="-80" y="-30" width="160" height="60" rx="5" fill="#cce5ff" stroke="#004085" stroke-width="2"/>
      <foreignObject x="-80" y="-30" width="160" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="display:table-cell;color:#004085;font-weight:bold"><span class="nodeLabel"><p>Static</p></span></div></foreignObject>
    </g>
    <g class="edgePath">
      <foreignObject width="0" height="0"><div xmlns="http://www.w3.org/1999/xhtml" class="labelBkg"><span class="edgeLabel"></span></div></foreignObject>
    </g>
  </svg>`
}

describe('stripForeignObjects', () => {
  it('removes all foreignObjects and preserves text', () => {
    const svg = createSvgWithFo(
      '<foreignObject x="-60" y="-25" width="120" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#155724;font-weight:bold"><span class="nodeLabel"><p>Hello</p></span></div></foreignObject>'
    )
    const result = stripForeignObjects(svg)
    expect(result).not.toContain('<foreignObject')
    expect(result).toContain('Hello')
  })

  it('extracts text content correctly', () => {
    const svg = createSvgWithFo(
      '<foreignObject x="-60" y="-25" width="120" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#155724"><span class="nodeLabel"><p>Simple Text</p></span></div></foreignObject>'
    )
    const result = stripForeignObjects(svg)
    expect(result).toContain('Simple Text')
    expect(result).toContain('text-anchor="middle"')
  })

  it('preserves color from style', () => {
    const svg = createSvgWithFo(
      '<foreignObject x="-60" y="-25" width="120" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#155724;font-weight:bold"><span class="nodeLabel"><p>Colored</p></span></div></foreignObject>'
    )
    const result = stripForeignObjects(svg)
    expect(result).toContain('fill="#155724"')
    expect(result).toContain('font-weight="bold"')
  })

  it('handles multi-line text with br tags', () => {
    const svg = createSvgWithFo(
      '<foreignObject x="-80" y="-30" width="160" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#004085;font-weight:bold"><span class="nodeLabel"><p>Line1<br/>Line2<br/>Line3</p></span></div></foreignObject>'
    )
    const result = stripForeignObjects(svg)
    expect(result).toContain('Line1')
    expect(result).toContain('Line2')
    expect(result).toContain('Line3')
    const tspanCount = (result.match(/<tspan/g) || []).length
    expect(tspanCount).toBe(3)
  })

  it('uses shape center for positioning', () => {
    const svg = createSvgWithFo(
      '<foreignObject x="-60" y="-25" width="120" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#155724"><span class="nodeLabel"><p>Centered</p></span></div></foreignObject>'
    )
    const result = stripForeignObjects(svg)
    expect(result).toContain('x="0"')
  })

  it('handles edge label foreignObjects with empty text', () => {
    const svg = createSvgWithFo(
      '<foreignObject x="-60" y="-25" width="120" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#155724"><span class="nodeLabel"><p>Node1</p></span></div></foreignObject>'
    )
    const result = stripForeignObjects(svg)
    expect(result).not.toContain('<foreignObject')
    expect(result).toContain('Node1')
    expect(result).toContain('Static')
  })

  it('preserves style block through parse/serialize round-trip', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <style>#flowchart-node1{font-family:Rubik;font-size:16px;fill:#333}</style>
      <g transform="translate(100,50)">
        <rect x="-60" y="-25" width="120" height="50" rx="5" fill="#d4edda"/>
        <foreignObject x="-60" y="-25" width="120" height="50"><div xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel"><p>Hello</p></span></div></foreignObject>
      </g>
    </svg>`
    const result = stripForeignObjects(svg)
    expect(result).toContain('<style>')
    expect(result).toContain('font-family:Rubik')
    expect(result).toContain('#flowchart-node1')
    expect(result).toContain('Hello')
    expect(result).not.toContain('<foreignObject')
  })

  it('handles multi-line text from full SVG', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <g transform="translate(200,150)">
        <rect x="-80" y="-30" width="160" height="60" rx="5" fill="#cce5ff" stroke="#004085" stroke-width="2"/>
        ${SVG_MULTILINE_FO}
      </g>
    </svg>`
    const result = stripForeignObjects(svg)
    expect(result).toContain('Line1')
    expect(result).toContain('Line2')
    expect(result).toContain('Line3')
    const tspanCount = (result.match(/<tspan/g) || []).length
    expect(tspanCount).toBe(3)
  })
})
