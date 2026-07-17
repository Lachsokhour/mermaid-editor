/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { migrateMermaidCode } from '../utils/migrateMermaid'

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

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    maxTextSize: 50000,
    securityLevel: 'loose',
    fontFamily: 'Rubik',
    themeVariables: { darkMode: false, background: '#ffffff', primaryColor: '#6366f1' },
  })
})

const simpleDiagram = `graph TD
    A["Hello World"] --> B["Second Node"]
    B --> C["Third Node"]`

const complexDiagram = `graph TD
    classDef main fill:#d4edda,stroke:#155724,stroke-width:2px,rx:10,ry:10,color:#155724,font-weight:bold;
    A["ចាប់ផ្តើមរៀន"]:::main --> B("ជំហានទី១"):::main
    B --> B1["Line1<br>Line2<br>Line3"]:::main`

describe('SVG structure analysis', () => {
  it('simple diagram SVG structure', async () => {
    const { svg } = await mermaid.render('test-svg-struct', simpleDiagram)
    const hasForeignObject = svg.includes('<foreignObject')
    const hasStyleBlock = svg.includes('<style>')
    const hasViewBox = svg.includes('viewBox')
    const xmlnsPresent = svg.includes('xmlns=')

    console.log('=== Simple SVG Analysis ===')
    console.log('SVG length:', svg.length)
    console.log('Has foreignObject:', hasForeignObject)
    console.log('Has <style> block:', hasStyleBlock)
    console.log('Has viewBox:', hasViewBox)
    console.log('Has xmlns:', xmlnsPresent)

    if (hasForeignObject) {
      const foCount = (svg.match(/<foreignObject/g) || []).length
      console.log('foreignObject count:', foCount)
      const foRegex = /<foreignObject[^>]*>([\s\S]*?)<\/foreignObject>/g
      let match, i = 0
      while ((match = foRegex.exec(svg)) !== null && i < 3) {
        console.log(`foreignObject ${i}:`, match[0].slice(0, 400))
        i++
      }
    }

    if (hasStyleBlock) {
      const styleMatch = svg.match(/<style[^>]*>([\s\S]*?)<\/style>/)
      if (styleMatch) {
        console.log('Style content (first 600 chars):', styleMatch[1].slice(0, 600))
      }
    }

    expect(hasViewBox).toBe(true)
  })

  it('complex diagram SVG structure', async () => {
    const code = migrateMermaidCode(complexDiagram)
    const { svg } = await mermaid.render('test-svg-complex', code)

    console.log('=== Complex SVG Analysis ===')
    console.log('SVG length:', svg.length)

    const hasForeignObject = svg.includes('<foreignObject')
    console.log('Has foreignObject:', hasForeignObject)

    const hasStyleBlock = svg.includes('<style>')
    console.log('Has <style> block:', hasStyleBlock)

    if (hasStyleBlock) {
      const styleMatch = svg.match(/<style[^>]*>([\s\S]*?)<\/style>/)
      if (styleMatch) {
        console.log('Style content (first 1000 chars):', styleMatch[1].slice(0, 1000))
      }
    }

    if (hasForeignObject) {
      const foRegex = /<foreignObject[^>]*>([\s\S]*?)<\/foreignObject>/g
      let match, i = 0
      while ((match = foRegex.exec(svg)) !== null && i < 5) {
        console.log(`\nforeignObject ${i} (full):`, match[0])
        i++
      }
    }

    expect(svg.length).toBeGreaterThan(100)
  })

  it('parentheses in labels - what does mermaid produce?', async () => {
    // Test round nodes with parens inside
    const rawRound = `graph TD
    A("Hello (world)") --> B["text (parens)"]
    B --> C("mix (parens) here")`

    let rawOk = false, rawSvg = ''
    try {
      const r = await mermaid.render('test-round-parens', rawRound)
      rawSvg = r.svg
      rawOk = true
    } catch (e) {
      console.log('Round node raw parse ERROR:', e.message?.slice(0, 200))
    }

    const migrated = migrateMermaidCode(rawRound)
    let migOk = false, migSvg = ''
    try {
      const r = await mermaid.render('test-round-mig', migrated)
      migSvg = r.svg
      migOk = true
    } catch (e) {
      console.log('Round node migrated parse ERROR:', e.message?.slice(0, 200))
    }

    console.log('\n=== Round node test ===')
    console.log('Raw:', rawOk, '| Migrated:', migOk)
    if (rawOk) {
      const pMatches = rawSvg.match(/<p[^>]*>.*?<\/p>/g)
      console.log('Raw <p>:', pMatches)
    }
    if (migOk) {
      const pMatches = migSvg.match(/<p[^>]*>.*?<\/p>/g)
      console.log('Migrated <p>:', pMatches)
    }

    // Also test the full Khmer diagram with parens
    const khmerCode = `graph TD
    A["ចាប់ផ្តើមរៀន"] --> B("ជំហានទី១")
    B --> C["ឃ្លា (មាន ៧ព្យាង្គ)"]
    C --> D("ចួន (ឆ្លងវគ្គ)")`

    let khmerOk = false
    try {
      await mermaid.render('test-khmer-parens', khmerCode)
      khmerOk = true
    } catch (e) {
      console.log('Khmer raw parse ERROR:', e.message?.slice(0, 200))
    }
    console.log('Khmer with parens parses OK:', khmerOk)

    expect(rawOk).toBe(true)
  })
})
