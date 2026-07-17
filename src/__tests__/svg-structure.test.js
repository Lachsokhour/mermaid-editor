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
    // User's EXACT diagram — unquoted brackets with parens
    const userDiagram = `graph TD
    A["ចាប់ផ្តើមរៀនតែងកំណាព្យបទពាក្យ៧"] --> B(ជំហានទី១៖ យល់ដឹងពីទម្រង់មូលដ្ឋាន)
    B --> B1[ស្គាល់រចនាសម្ព័ន្ធ៖<br>• ១វគ្គ មាន ៤ឃ្លា<br>• ១ឃ្លា មាន ៧ព្យាង្គ/ពាក្យ]

    B1 --> C(ជំហានទី២៖ សិក្សាពីច្បាប់ចុងចួន)
    C --> C1[ចួនក្នុងវគ្គ៖<br>• ព្យាង្គទី៧ ឃ្លាទី១ ចួននឹង ព្យាង្គទី៣, ៤ ឬ៥ ឃ្លាទី២<br>• ព្យាង្គទី៧ ឃ្លាទី២ ចួននឹង ព្យាង្គទី៧ ឃ្លាទី៣<br>• ព្យាង្គទី៧ ឃ្លាទី៣ ចួននឹង ព្យាង្គទី៣, ៤ ឬ៥ ឃ្លាទី៤]
    C --> C2[ចួនឆ្លងវគ្គ (ជើងក្អែក)៖<br>• ព្យាង្គទី៧ ឃ្លាទី៤ នៃវគ្គទី១ ចួននឹង ព្យាង្គទី៧ ឃ្លាទី២ នៃវគ្គទី២]

    C1 --> D(ជំហានទី៣៖ ជ្រើសរើសប្រធានបទ)
    C2 --> D
    D --> D1[កំណត់គំនិតស្នូល អារម្មណ៍ ឬសាច់រឿង]
    D --> D2[ប្រមូលពាក្យគន្លឹះ និងពាក្យដែលមានសូរចួនគ្នាទុកមុន]

    D1 --> E(ជំហានទី៤៖ ចាប់ផ្តើមតែងសាកល្បង)
    D2 --> E
    E --> E1[សរសេរឃ្លាទី១ (ត្រូវតែបង្កប់ន័យចាប់ផ្តើមទាក់ទាញ)]
    E1 --> E2[តែងឃ្លាបន្តបន្ទាប់ ដោយផ្អែកលើការចងចួន និងខ្លឹមសារ]
    E2 --> E3[ថែរក្សាអត្ថន័យឱ្យរត់ធ្លុងគ្នាល្អពីឃ្លាមួយទៅឃ្លាមួយ]

    E3 --> F(ជំហានទី៥៖ ផ្ទៀងផ្ទាត់ និងសម្រួលទឹកដម)
    F --> F1[រាប់ព្យាង្គឡើងវិញ (កុំឱ្យលើស ឬខ្វះ ៧ព្យាង្គ)]
    F --> F2[ផ្ទៀងផ្ទាត់ចំណុចចួន (ក្រែងលោខុសចំណុចបង្គោលចួន)]
    F --> F3[អានបង្អូសរលាក់សូរ ដើម្បីស្តាប់ទឹកដម និងភាពរលូន]

    F1 --> G[ទទួលបានកំណាព្យបទពាក្យ៧ ដ៏ពីរោះ និងត្រឹមត្រូវ]
    F2 --> G
    F3 --> G`

    // Test 1: raw diagram — should it parse?
    let rawOk = false
    try {
      await mermaid.render('test-user-raw', userDiagram)
      rawOk = true
    } catch (e) {
      console.log('User diagram raw parse fails:', e.message?.slice(0, 150))
    }
    console.log('Raw user diagram parses:', rawOk)

    // Test 2: migrateMermaidCode should wrap unquoted brackets with parens in quotes
    const migrated = migrateMermaidCode(userDiagram)
    console.log('\n=== Migration diff ===')
    const origLines = userDiagram.split('\n')
    const migLines = migrated.split('\n')
    for (let i = 0; i < Math.max(origLines.length, migLines.length); i++) {
      if (origLines[i] !== migLines[i]) {
        console.log(`  line ${i}:`)
        console.log(`    old: ${origLines[i]?.trim()}`)
        console.log(`    new: ${migLines[i]?.trim()}`)
      }
    }

    // Test 3: migrated code should parse
    let migOk = false
    let migSvg = ''
    try {
      const r = await mermaid.render('test-user-mig', migrated)
      migSvg = r.svg
      migOk = true
    } catch (e) {
      console.log('\nMigrated diagram parse fails:', e.message?.slice(0, 200))
    }
    console.log('Migrated diagram parses:', migOk)

    if (migOk) {
      // Check all foreignObject text for corruption
      const pMatches = migSvg.match(/<p>.*?<\/p>/g)
      console.log('\n=== Rendered labels ===')
      pMatches?.forEach(p => {
        const text = p.replace(/<[^>]+>/g, '')
        const corrupted = text.includes('&(') || text.includes('&)')
        console.log(`  ${corrupted ? '❌ CORRUPTED' : '✅'} ${text}`)
      })
    }

    expect(migOk).toBe(true)
  })
})
