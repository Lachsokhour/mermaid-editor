/**
 * Workaround for mermaid v11.15.0 renderer bug:
 * Khmer text inside stadium ([...]) nodes connected to edges causes
 * mermaid.render() to fail with "Invalid character", even though
 * mermaid.parse() accepts the syntax.
 *
 * This converts stadium nodes containing Khmer text to rectangle nodes
 * (["..."]) which render correctly.
 */
export function hasKhmerStadiumNode(code) {
  return /\(\[[^\]]*[\u1780-\u17FF\u19E0-\u19FF][^\]]*\]\)/.test(code)
}

export function fixKhmerStadiumNodes(code) {
  return code.replace(
    /\(\[([^\]]*[\u1780-\u17FF\u19E0-\u19FF][^\]]*)\]\)/g,
    (match, content) => {
      const trimmed = content.replace(/^"([\s\S]*)"$/, '$1')
      return `["${trimmed}"]`
    }
  )
}

export function tryRender(mermaid, id, code) {
  return mermaid.render(id, code).catch(err => {
    if (
      err?.message?.includes('Invalid character') &&
      hasKhmerStadiumNode(code)
    ) {
      const fixed = fixKhmerStadiumNodes(code)
      return mermaid.render(id, fixed)
    }
    throw err
  })
}
