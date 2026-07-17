/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { hasKhmerStadiumNode, fixKhmerStadiumNodes } from '../utils/fixDiagram'

describe('fixKhmerStadiumNodes', () => {
  it('detects Khmer in unquoted stadium', () => {
    expect(hasKhmerStadiumNode('A([ចាប់ផ្តើម]) --> B')).toBe(true)
  })
  it('detects Khmer in quoted stadium', () => {
    expect(hasKhmerStadiumNode('A(["ចាប់ផ្តើម"]) --> B')).toBe(true)
  })
  it('does not detect English stadium', () => {
    expect(hasKhmerStadiumNode('A([Start]) --> B')).toBe(false)
  })
  it('does not detect plain rectangle', () => {
    expect(hasKhmerStadiumNode('A["ចាប់ផ្តើម"] --> B')).toBe(false)
  })
  it('fixes unquoted Khmer stadium', () => {
    expect(fixKhmerStadiumNodes('A([ចាប់ផ្តើម]) --> B'))
      .toBe('A["ចាប់ផ្តើម"] --> B')
  })
  it('fixes quoted Khmer stadium', () => {
    expect(fixKhmerStadiumNodes('A(["ចាប់ផ្តើម"]) --> B'))
      .toBe('A["ចាប់ផ្តើម"] --> B')
  })
  it('fixes multiple Khmer stadiums', () => {
    expect(fixKhmerStadiumNodes('A([ចាប់ផ្តើម]) --> B(["ជំហានទី១"])'))
      .toBe('A["ចាប់ផ្តើម"] --> B["ជំហានទី១"]')
  })
  it('leaves English stadium unchanged', () => {
    expect(fixKhmerStadiumNodes('A([Start]) --> B')).toBe('A([Start]) --> B')
  })
  it('leaves code without stadiums unchanged', () => {
    expect(fixKhmerStadiumNodes('A["Khmer"] --> B')).toBe('A["Khmer"] --> B')
  })
})
