import { StreamLanguage } from '@codemirror/language'

const DIAGRAM_TYPES = /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram[-v2]?|erDiagram|entityRelationshipDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitgraph|mindmap|timeline|kanban|xychart|block|sankey|packet|architecture|ishikawa|treeview|treemap|radar|venn|wardley|objectDiagram|c4context|c4container|c4component|c4deployment)\b/i

const KEYWORDS = new Set([
  'subgraph', 'end', 'direction', 'link', 'click', 'style', 'classDef',
  'class', 'linkStyle', 'highlight', 'destroy', 'actor', 'participant',
  'note', 'opt', 'loop', 'alt', 'else', 'par', 'rect', 'critical',
  'break', 'autonumber', 'activate', 'deactivate', 'create', 'destroy',
  'State', 'scale', 'title', 'accDescr', 'accTitle', 'config',
  'section',
])

const TAG_MAP = {
  comment: 'comment',
  directive: 'meta',
  string: 'string',
  label: 'labelName',
  arrow: 'operator',
  bracket: 'bracket',
  diagramType: 'typeName',
  keyword: 'keyword',
  number: 'number',
}

export function mermaidLanguage() {
  return StreamLanguage.define({
    startState() {
      return { inComment: false, inLabel: false, inInit: false }
    },

    token(stream, state) {
      if (state.inComment) {
        stream.skipToEnd()
        state.inComment = false
        return TAG_MAP.comment
      }

      if (state.inLabel) {
        const m = stream.match(/.*?\|/)
        if (m) {
          state.inLabel = false
        } else {
          stream.skipToEnd()
        }
        return TAG_MAP.label
      }

      if (state.inInit) {
        const m = stream.match(/.*?%\}/)
        if (m) {
          state.inInit = false
        } else {
          stream.skipToEnd()
        }
        return TAG_MAP.directive
      }

      if (stream.eatSpace()) return null

      if (stream.match(/%%\{/)) {
        state.inInit = true
        return TAG_MAP.directive
      }

      if (stream.match(/%%/)) {
        state.inComment = true
        return TAG_MAP.comment
      }

      const ch = stream.peek()

      if (ch === '"' || ch === "'") {
        stream.next()
        stream.match(/.*?["']/)
        return TAG_MAP.string
      }

      if (ch === '|') {
        state.inLabel = true
        stream.next()
        return TAG_MAP.label
      }

      if (/^[-=.<>x]$/.test(ch)) {
        if (stream.match(/[<=]*(?:-{1,3}|\.{2,3}|={1,3})[>x]?|[<=](?:-{1,3}|\.{2,3}|={1,3})?/)) {
          return TAG_MAP.arrow
        }
        stream.next()
        return null
      }

      if (/[\[\](){}]/.test(ch)) {
        stream.next()
        return TAG_MAP.bracket
      }

      const word = stream.match(/[\w.\u0080-\uFFFF]+/)
      if (word) {
        if (DIAGRAM_TYPES.test(word[0])) return TAG_MAP.diagramType
        const lower = word[0].toLowerCase()
        if (KEYWORDS.has(lower)) return TAG_MAP.keyword
        if (/^\d/.test(word[0])) return TAG_MAP.number
        return null
      }

      stream.next()
      return null
    },
  })
}


