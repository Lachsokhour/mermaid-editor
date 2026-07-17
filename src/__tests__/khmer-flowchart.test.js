/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'

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

describe('Mermaid parse: ASCII baseline', () => {
  it('simple graph TD', async () => {
    expect(await canParse('graph TD\n  A[Hello] --> B[World]')).toBe(true)
  })

  it('parentheses inside square brackets FAILS', async () => {
    expect(await canParse('graph TD\n  A[text (parens)] --> B[next]')).toBe(false)
  })

  it('parentheses escaped with &#40; &#41; WORKS', async () => {
    expect(await canParse('graph TD\n  A[text &#40;parens&#41;] --> B[next]')).toBe(true)
  })

  it('parentheses in quoted label WORKS', async () => {
    expect(await canParse('graph TD\n  A["text (parens)"] --> B[next]')).toBe(true)
  })

  it('slash inside brackets', async () => {
    expect(await canParse('graph TD\n  A[text/a] --> B[next]')).toBe(true)
  })

  it('comma inside brackets', async () => {
    expect(await canParse('graph TD\n  A[text, more] --> B[next]')).toBe(true)
  })

  it('br tag inside brackets', async () => {
    expect(await canParse('graph TD\n  A[text<br>more] --> B[next]')).toBe(true)
  })

  it('round node with text', async () => {
    expect(await canParse('graph TD\n  A(Hello) --> B[World]')).toBe(true)
  })

  it('round node with parens inside FAILS', async () => {
    expect(await canParse('graph TD\n  A(Hello (world)) --> B[Next]')).toBe(false)
  })

  it('round node with &#40; &#41; WORKS', async () => {
    expect(await canParse('graph TD\n  A(Hello &#40;world&#41;) --> B[Next]')).toBe(true)
  })

  it('round node with quoted label WORKS', async () => {
    expect(await canParse('graph TD\n  A["Hello (world)"] --> B[Next]')).toBe(true)
  })
})

describe('Mermaid parse: Khmer with fixes', () => {
  it('Khmer with &#40; &#41; WORKS', async () => {
    expect(await canParse('graph TD\n  A[សួស្តី &#40;ជើងក្អែក&#41;] --> B[លាហើយ]')).toBe(true)
  })

  it('Khmer with quoted label WORKS', async () => {
    expect(await canParse('graph TD\n  A["សួស្តី (ជើងក្អែក)"] --> B[លាហើយ]')).toBe(true)
  })

  it('full Khmer diagram with &#40; &#41; escaping', async () => {
    const code = `graph TD
    A[ចាប់ផ្តើមរៀនតែងកំណាព្យបទពាក្យ៧] --> B(ជំហានទី១៖ យល់ដឹងពីទម្រង់មូលដ្ឋាន)
    B --> B1[ស្គាល់រចនាសម្ព័ន្ធ៖<br>• ១វគ្គ មាន ៤ឃ្លា<br>• ១ឃ្លា មាន ៧ព្យាង្គ/ពាក្យ]

    B1 --> C(ជំហានទី២៖ សិក្សាពីច្បាប់ចុងចួន)
    C --> C1[ចួនក្នុងវគ្គ៖<br>• ព្យាង្គទី៧ ឃ្លាទី១ ចួននឹង ព្យាង្គទី៣, ៤ ឬ៥ ឃ្លាទី២<br>• ព្យាង្គទី៧ ឃ្លាទី២ ចួននឹង ព្យាង្គទី៧ ឃ្លាទី៣<br>• ព្យាង្គទី៧ ឃ្លាទី៣ ចួននឹង ព្យាង្គទី៣, ៤ ឬ៥ ឃ្លាទី៤]
    C --> C2[ចួនឆ្លងវគ្គ &#40;ជើងក្អែក&#41;៖<br>• ព្យាង្គទី៧ ឃ្លាទី៤ នៃវគ្គទី១ ចួននឹង ព្យាង្គទី៧ ឃ្លាទី២ នៃវគ្គទី២]

    C1 --> D(ជំហានទី៣៖ ជ្រើសរើសប្រធានបទ)
    C2 --> D
    D --> D1[កំណត់គំនិតស្នូល អារម្មណ៍ ឬសាច់រឿង]
    D --> D2[ប្រមូលពាក្យគន្លឹះ និងពាក្យដែលមានសូរចួនគ្នាទុកមុន]

    D1 --> E(ជំហានទី៤៖ ចាប់ផ្តើមតែងសាកល្បង)
    D2 --> E
    E --> E1[សរសេរឃ្លាទី១ &#40;ត្រូវតែបង្កប់ន័យចាប់ផ្តើមទាក់ទាញ&#41;]
    E1 --> E2[តែងឃ្លាបន្តបន្ទាប់ ដោយផ្អែកលើការចងចួន និងខ្លឹមសារ]
    E2 --> E3[ថែរក្សាអត្ថន័យឱ្យរត់ធ្លុងគ្នាល្អពីឃ្លាមួយទៅឃ្លាមួយ]

    E3 --> F(ជំហានទី៥៖ ផ្ទៀងផ្ទាត់ និងសម្រួលទឹកដម)
    F --> F1[រាប់ព្យាង្គឡើងវិញ &#40;កុំឱ្យលើស ឬខ្វះ ៧ព្យាង្គ&#41;]
    F --> F2[ផ្ទៀងផ្ទាត់ចំណុចចួន &#40;ក្រែងលោខុសចំណុចបង្គោលចួន&#41;]
    F --> F3[អានបង្អូសរលាក់សូរ ដើម្បីស្តាប់ទឹកដម និងភាពរលូន]

    F1 --> G[ទទួលបានកំណាព្យបទពាក្យ៧ ដ៏ពីរោះ និងត្រឹមត្រូវ]
    F2 --> G
    F3 --> G`
    expect(await canParse(code)).toBe(true)
  })
})
