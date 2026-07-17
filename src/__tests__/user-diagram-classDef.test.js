/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { sanitizeFlowchartParens, moveLinkStylesToEnd, migrateMermaidCode } from '../utils/migrateMermaid'

beforeAll(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    maxTextSize: 50000,
    securityLevel: 'loose',
    fontFamily: 'Rubik',
    themeVariables: { darkMode: false, background: '#ffffff' },
  })
})

const nodesAndClassDefs = `graph TD
    classDef main fill:#d4edda,stroke:#155724,stroke-width:2px,rx:10,ry:10,color:#155724,font-weight:bold;
    classDef process fill:#cce5ff,stroke:#004085,stroke-width:2px,rx:5,ry:5,color:#004085;
    classDef decision fill:#fff3cd,stroke:#856404,stroke-width:2px,color:#856404;
    classDef input fill:#f8d7da,stroke:#721c24,stroke-width:2px,stroke-dasharray: 5 5,color:#721c24;
    classDef endNode fill:#e2e3e5,stroke:#383d41,stroke-width:2px,rx:15,ry:15,color:#383d41,font-weight:bold;

    A["ចាប់ផ្តើមរៀនតែងកំណាព្យបទពាក្យ៧"]:::main
    B("ជំហានទី១៖ យល់ដឹងពីទម្រង់មូលដ្ឋាន"):::process
    B1["ស្គាល់រចនាសម្ព័ន្ធ៖<br>• ១វគ្គ មាន ៤ឃ្លា<br>• ១ឃ្លា មាន ៧ព្យាង្គ/ពាក្យ"]:::process

    C("ជំហានទី២៖ សិក្សាពីច្បាប់ចួនចួន"):::decision
    C1["ចួនក្នុងវគ្គ៖<br>• ព្យាង្គទី៧ ឃ្លាទី១ ចួននឹង ព្យាង្គទី៣, ៤ ឬ៥ ឃ្លាទី២<br>• ព្យាង្គទី៧ ឃ្លាទី២ ចួននឹង ព្យាង្គទី៧ ឃ្លាទី៣<br>• ព្យាង្គទី៧ ឃ្លាទី៣ ចួននឹង ព្យាង្គទី៣, ៤ ឬ៥ ឃ្លាទី៤"]:::decision
    C2["ចួនឆ្លងវគ្គ (ជើងក្អែក)៖<br>• ព្យាង្គទី៧ ឃ្លាទី៤ នៃវគ្គទី១ ចួននឹង ព្យាង្គទី៧ ឃ្លាទី២ នៃវគ្គទី២"]:::decision

    D("ជំហានទី៣៖ ជ្រើសរើសប្រធានបទ"):::input
    D1["កំណត់គំនិតស្នូល អារម្មណ៍ ឬសាច់រឿង"]:::input
    D2["ប្រមូលពាក្យគន្លឹះ និងពាក្យដែលមានសូរចួនគ្នាទុកមុន"]:::input

    E("ជំហានទី៤៖ ចាប់ផ្តើមតែងសាកល្បង"):::process
    E1["សរសេរឃ្លាទី១ (ត្រូវតែបង្កប់ន័យចាប់ផ្តើមទាក់ទាញ)"]:::process
    E2["តែងឃ្លាបន្តបន្ទាប់ ដោយផ្អែកលើការចងចួន និងខ្លឹមសារ"]:::process
    E3["ថែរក្សាអត្ថន័យឱ្យរត់ធ្លុងគ្នាល្អពីឃ្លាមួយទៅឃ្លាមួយ"]:::process

    F("ជំហានទី៥៖ ផ្ទៀងផ្ទាត់ និងសម្រួលទឹកដម"):::input
    F1["រាប់ព្យាង្គឡើងវិញ (កុំឱ្យលើស ឬខ្វះ ៧ព្យាង្គ)"]:::input
    F2["ផ្ទៀងផ្ទាត់ចំណុចចួន (ក្រែងលោខុសចំណុចបង្គោលចួន)"]:::input
    F3["អានបង្អូសរលាក់សូរ ដើម្បីស្តាប់ទឹកដម និងភាពរលូន"]:::input

    G["ទទួលបានកំណាព្យបទពាក្យ៧ ដ៏ពីរោះ និងត្រឹមត្រូវ"]:::endNode`

const edgesBlock = `
    A --> B
    B --> B1
    B1 --> C
    C --> C1
    C --> C2
    C1 --> D
    C2 --> D
    D --> D1
    D --> D2
    D1 --> E
    D2 --> E
    E --> E1
    E1 --> E2
    E2 --> E3
    E3 --> F
    F --> F1
    F --> F2
    F --> F3
    F1 --> G
    F2 --> G
    F3 --> G`

const linkStylesBlock = `
    linkStyle 0 stroke:#155724,stroke-width:2px;
    linkStyle 1 stroke:#004085,stroke-width:2px;
    linkStyle 2 stroke:#004085,stroke-width:2px;
    linkStyle 3 stroke:#856404,stroke-width:2px;
    linkStyle 4 stroke:#856404,stroke-width:2px;
    linkStyle 5 stroke:#721c24,stroke-width:2px;
    linkStyle 6 stroke:#721c24,stroke-width:2px;
    linkStyle 7 stroke:#721c24,stroke-width:2px;
    linkStyle 8 stroke:#721c24,stroke-width:2px;
    linkStyle 9 stroke:#004085,stroke-width:2px;
    linkStyle 10 stroke:#004085,stroke-width:2px;
    linkStyle 11 stroke:#004085,stroke-width:2px;
    linkStyle 12 stroke:#004085,stroke-width:2px;
    linkStyle 13 stroke:#721c24,stroke-width:2px;
    linkStyle 14 stroke:#721c24,stroke-width:2px;
    linkStyle 15 stroke:#721c24,stroke-width:2px;
    linkStyle 16 stroke:#721c24,stroke-width:2px;
    linkStyle 17 stroke:#383d41,stroke-width:2px;
    linkStyle 18 stroke:#383d41,stroke-width:2px;
    linkStyle 19 stroke:#383d41,stroke-width:2px;`

describe('User diagram: linkStyle ordering fix', () => {
  it('FAILS when linkStyle comes before edges', async () => {
    const code = nodesAndClassDefs + linkStylesBlock + edgesBlock
    await expect(mermaid.parse(code)).rejects.toThrow()
  })

  it('moveLinkStylesToEnd moves linkStyle after edges', () => {
    const code = nodesAndClassDefs + linkStylesBlock + edgesBlock
    const result = moveLinkStylesToEnd(code)
    const linkStyleIdx = result.lastIndexOf('linkStyle')
    const lastEdgeIdx = result.lastIndexOf('-->')
    expect(linkStyleIdx).toBeGreaterThan(lastEdgeIdx)
  })

  it('migrateMermaidCode produces parseable output', async () => {
    const code = nodesAndClassDefs + linkStylesBlock + edgesBlock
    const migrated = migrateMermaidCode(code)
    await expect(mermaid.parse(migrated)).resolves.toBeDefined()
  })

  it('no-op when linkStyle already after edges', () => {
    const code = nodesAndClassDefs + edgesBlock + linkStylesBlock
    const result = moveLinkStylesToEnd(code)
    expect(result).toBe(code)
  })

  it('no-op when no linkStyle lines', () => {
    const code = nodesAndClassDefs + edgesBlock
    const result = moveLinkStylesToEnd(code)
    expect(result).toBe(code)
  })
})
