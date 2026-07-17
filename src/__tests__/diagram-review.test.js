/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest'
import mermaid from 'mermaid'
import { tryRender } from '../utils/fixDiagram'

beforeAll(async () => {
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
  })
})

describe('Stadium node parse vs render', () => {
  async function canParse(code) { try { await mermaid.parse(code); return true } catch { return false } }
  async function canRender(code) { try { await mermaid.render('x', code); return true } catch { return false } }

  it('bare stadium parse', async () => expect(await canParse('graph TD\nA([Khmer])')).toBe(true))
  it('bare stadium render', async () => expect(await canRender('graph TD\nA([Khmer])')).toBe(true))

  // mermaid v11.15.0 bug: parse passes but render fails for Khmer stadium + edge
  it('stadium + edge parse', async () => expect(await canParse('graph TD\nA([Khmer]) --> B')).toBe(true))
  it('stadium + edge render', async () => expect(await canRender('graph TD\nA([Khmer]) --> B')).toBe(true))

  it('quoted stadium parse', async () => expect(await canParse('graph TD\nA(["Khmer"]) --> B')).toBe(true))
  it('quoted stadium render', async () => expect(await canRender('graph TD\nA(["Khmer"]) --> B')).toBe(true))

  it('EN stadium + edge render', async () => expect(await canRender('graph TD\nA([Start]) --> B')).toBe(true))

  it('Khmer bare stadium render', async () => expect(await canRender('graph TD\nA([ចាប់ផ្តើម])')).toBe(true))

  // These raw renders fail due to the mermaid bug
  it('Khmer stadium + edge render FAILS (mermaid bug)', async () => expect(await canRender('graph TD\nA([ចាប់ផ្តើម]) --> B')).toBe(false))
  it('Khmer quoted stadium + edge render FAILS (mermaid bug)', async () => expect(await canRender('graph TD\nA(["ចាប់ផ្តើម"]) --> B')).toBe(false))
})

describe('tryRender workaround', () => {
  it('fixes Khmer unquoted stadium + edge', async () => expect(await tryRender(mermaid, 'x', 'graph TD\nA([ចាប់ផ្តើម]) --> B')).not.toThrow)
  it('fixes Khmer quoted stadium + edge', async () => expect(await tryRender(mermaid, 'x', 'graph TD\nA(["ចាប់ផ្តើម"]) --> B')).not.toThrow)
  it('fixes multiple Khmer stadiums', async () => expect(await tryRender(mermaid, 'x', 'graph TD\nA([ចាប់ផ្តើម]) --> B(["ជំហានទី១"])')).not.toThrow)
  it('leaves English stadium unchanged', async () => {
    const { svg } = await tryRender(mermaid, 'x', 'graph TD\nA([Start]) --> B')
    expect(svg).toBeTruthy()
    expect(svg).toContain('Start')
  })
  it('leaves plain diagram unchanged', async () => {
    const { svg } = await tryRender(mermaid, 'x', 'graph TD\nA["Hello"] --> B')
    expect(svg).toBeTruthy()
  })
  it('rethrows non-Invalid-character errors', async () => {
    await expect(tryRender(mermaid, 'x', 'garbage')).rejects.toThrow()
  })
})
