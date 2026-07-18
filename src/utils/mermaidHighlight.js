import { StateField, RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'

const diagramTypeRE = /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram[-v2]?|erDiagram|entityRelationshipDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitgraph|mindmap|timeline|kanban|xychart|block|sankey|packet|architecture|ishikawa|treeview|treemap|radar|venn|wardley|objectDiagram|c4context|c4container|c4component|c4deployment)\b/

const keywordSet = new Set([
  'subgraph', 'end', 'direction', 'link', 'click', 'style', 'classDef',
  'class', 'linkStyle', 'highlight', 'destroy', 'actor', 'participant',
  'note', 'opt', 'loop', 'alt', 'else', 'par', 'rect', 'critical',
  'break', 'autonumber', 'activate', 'deactivate', 'create', 'destroy',
  'State', 'scale', 'title', 'accDescr', 'accTitle', 'config', 'section',
])

const dec = (className) => Decoration.mark({ class: `cm-mermaid-${className}` })

function buildDecorations(doc) {
  const builder = new RangeSetBuilder()
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const text = line.text
    let pos = 0

    const flush = (end) => {
      if (end > pos) builder.add(pos, end, dec('plain'))
    }

    while (pos < text.length) {
      const rest = text.slice(pos)

      const directive = rest.match(/^%%\{.*?%\}/)
      if (directive) {
        flush(pos)
        builder.add(pos + line.from, pos + line.from + directive[0].length, dec('directive'))
        pos += directive[0].length
        continue
      }

      const comment = rest.match(/^%%/)
      if (comment) {
        flush(pos)
        builder.add(pos + line.from, line.to, dec('comment'))
        break
      }

      if (/^\s/.test(rest)) {
        pos++
        continue
      }

      const label = rest.match(/^\|/)
      if (label) {
        const end = text.indexOf('|', pos + 1)
        const to = end !== -1 ? end + 1 : text.length
        flush(pos)
        builder.add(pos + line.from, Math.min(pos + line.from + to - pos, line.to), dec('label'))
        pos = to
        continue
      }

      const bracket = rest.match(/^[\[\](){}]/)
      if (bracket) {
        flush(pos)
        builder.add(pos + line.from, pos + line.from + 1, dec('bracket'))
        pos++
        continue
      }

      if (/^[-=.<>x]/.test(rest)) {
        const m = rest.match(/^[<=]*(?:-{1,3}|\.{2,3}|={1,3})[>x]?|[<=](?:-{1,3}|\.{2,3}|={1,3})?/)
        if (m && m[0].length > 0) {
          flush(pos)
          builder.add(pos + line.from, pos + line.from + m[0].length, dec('arrow'))
          pos += m[0].length
          continue
        }
        flush(pos)
        builder.add(pos + line.from, pos + line.from + 1, dec('plain'))
        pos++
        continue
      }

      if (rest[0] === '"' || rest[0] === "'") {
        const q = rest[0]
        const end = text.indexOf(q, pos + 1)
        const to = end !== -1 ? end + 1 : text.length
        flush(pos)
        builder.add(pos + line.from, Math.min(pos + line.from + to - pos, line.to), dec('string'))
        pos = to
        continue
      }

      const word = rest.match(/^[\w.\u0080-\uFFFF]+/)
      if (word) {
        const w = word[0]
        if (diagramTypeRE.test(w)) {
          flush(pos)
          builder.add(pos + line.from, pos + line.from + w.length, dec('diagramType'))
        } else if (keywordSet.has(w.toLowerCase())) {
          flush(pos)
          builder.add(pos + line.from, pos + line.from + w.length, dec('keyword'))
        } else if (/^\d/.test(w)) {
          flush(pos)
          builder.add(pos + line.from, pos + line.from + w.length, dec('number'))
        }
        pos += w.length
        continue
      }

      pos++
    }
  }
  return builder.finish()
}

export const mermaidHighlightField = StateField.define({
  create(state) {
    return buildDecorations(state.doc)
  },
  update(deco, tr) {
    if (tr.docChanged) return buildDecorations(tr.state.doc)
    return deco
  },
  provide: f => EditorView.decorations.from(f),
})
