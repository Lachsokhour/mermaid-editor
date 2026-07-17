/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { sanitizeFlowchartParens, escapeLabelParens } from '../utils/migrateMermaid'

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

describe('escapeLabelParens', () => {
  it('replaces ( with &#40;', () => {
    expect(escapeLabelParens('hello (world)')).toBe('hello &#40;world&#41;')
  })

  it('leaves text without parens unchanged', () => {
    expect(escapeLabelParens('hello world')).toBe('hello world')
  })

  it('handles multiple parens', () => {
    expect(escapeLabelParens('a(b)c(d)e')).toBe('a&#40;b&#41;c&#40;d&#41;e')
  })

  it('handles empty string', () => {
    expect(escapeLabelParens('')).toBe('')
  })
})

describe('sanitizeFlowchartParens', () => {
  it('sanitizes parentheses inside square brackets', () => {
    const input = 'graph TD\n  A[text (parens)] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('text &#40;parens&#41;')
  })

  it('sanitizes parentheses inside round nodes', () => {
    const input = 'graph TD\n  A(Hello (world)) --> B[Next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('Hello &#40;world&#41;')
  })

  it('does not break simple nodes without parens', () => {
    const input = 'graph TD\n  A[Hello] --> B[World]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toBe(input)
  })

  it('does not break simple round nodes', () => {
    const input = 'graph TD\n  A(Hello) --> B[World]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toBe(input)
  })

  it('skips comment lines', () => {
    const input = 'graph TD\n  %% A[text (parens)] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('%%')
    expect(result).not.toContain('&#40;')
  })

  it('skips style lines', () => {
    const input = 'graph TD\n  A[Hello] --> B[World]\nstyle A fill:#000'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('style A fill:#000')
  })

  it('preserves arrow syntax', () => {
    const input = 'graph TD\n  A[text (parens)] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain(' --> ')
  })

  it('handles multiple nodes with parens', () => {
    const input = 'graph TD\n  A[text (a)] --> B[text (b)]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('text &#40;a&#41;')
    expect(result).toContain('text &#40;b&#41;')
  })

  it('handles br tags inside brackets', () => {
    const input = 'graph TD\n  A[text (a)<br>more (b)] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(result).toContain('text &#40;a&#41;<br>more &#40;b&#41;')
  })

  it('sanitized output is parseable by mermaid', async () => {
    const input = 'graph TD\n  A[text (parens)] --> B[next]'
    const result = sanitizeFlowchartParens(input)
    expect(await canParse(result)).toBe(true)
  })
})

describe('sanitizeFlowchartParens: Khmer diagram', () => {
  it('sanitizes the full Khmer diagram to be parseable', async () => {
    const code = `graph TD
    A[ចាប់ផ្តើមរៀនតែងកំណាព្យបទពាក្យ៧] --> B(ជំហានទី១៖ យល់ដឹងពីទម្រង់មូលដ្ឋាន)
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
    const sanitized = sanitizeFlowchartParens(code)
    expect(sanitized).not.toMatch(/]\(/)
    expect(sanitized).toContain('&#40;')
    expect(sanitized).toContain('&#41;')
    expect(await canParse(sanitized)).toBe(true)
  })
})
