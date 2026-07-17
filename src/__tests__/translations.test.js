import { describe, it, expect } from 'vitest'
import { en, kh } from '../i18n/translations'

function flatten(obj, prefix = '') {
  let result = {}
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? prefix + '.' + key : key
    if (typeof val === 'object' && val !== null) {
      Object.assign(result, flatten(val, k))
    } else {
      result[k] = val
    }
  }
  return result
}

const flatEn = flatten(en)
const flatKh = flatten(kh)

// All t() keys used in the codebase
const usedKeys = [
  // editor
  'editor.tab.code', 'editor.tab.style', 'editor.tab.docs',
  'editor.placeholder', 'editor.viewGuide', 'editor.viewMermaidDocs',

  // common
  'common.preview', 'common.code', 'common.docs',
  'common.search', 'common.enterCode', 'common.noDiagram', 'common.saved',
  'common.history', 'common.share', 'common.editWithAI', 'common.versionHistory',
  'common.restore', 'common.clearHistory', 'common.noHistory', 'common.empty',
  'common.copyMarkdown', 'common.copyImage', 'common.svg', 'common.png', 'common.link',
  'common.ctrlEnterRender', 'common.toggleTheme', 'common.toggleGrid', 'common.toggleSidebar',
  'common.zoomOut', 'common.zoomIn', 'common.resetView', 'common.fullScreen', 'common.exitFullscreen',
  'common.syntaxError', 'common.diagramColors', 'common.colors', 'common.styles', 'common.style',
  'common.harmony', 'common.presets', 'common.reset', 'common.primary', 'common.secondary',
  'common.line', 'common.background', 'common.text',
  'common.shareDiagram', 'common.presetLink', 'common.markdownLink', 'common.copyDiagramCode',
  'common.gettingStarted', 'common.documentation', 'common.keyboardShortcuts',
  'common.introLine1', 'common.introLine2', 'common.renderDiagram', 'common.saveState',
  'common.language',   'common.aiComingSoon', 'common.thisShape', 'common.learnMore',

  // toast
  'toast.saved', 'toast.markdownCopied', 'toast.linkCopied', 'toast.codeCopied',
  'toast.markdownLinkCopied', 'toast.copied', 'toast.failedToCopy',
  'toast.noDiagramDownload', 'toast.svgDownloaded', 'toast.noDiagramCopy',
  'toast.imageCopied', 'toast.failedCopyImage',

  // diagrams (all 27)
  'diagrams.flowchart', 'diagrams.class', 'diagrams.sequence', 'diagrams.entity-relationship',
  'diagrams.state', 'diagrams.info', 'diagrams.gantt', 'diagrams.kanban',
  'diagrams.timeline', 'diagrams.user-journey', 'diagrams.requirement', 'diagrams.mindmap',
  'diagrams.architecture', 'diagrams.block', 'diagrams.c4', 'diagrams.git',
  'diagrams.ishikawa', 'diagrams.packet', 'diagrams.pie', 'diagrams.quadrant',
  'diagrams.radar', 'diagrams.sankey', 'diagrams.treeview', 'diagrams.treemap',
  'diagrams.venn', 'diagrams.eventmodeling',

  // presets
  'presets.indigo', 'presets.emerald', 'presets.rose', 'presets.amber', 'presets.teal',

  // styleEditor (new)
  'styleEditor.tab.line', 'styleEditor.tab.colors', 'styleEditor.tab.text',
  'styleEditor.tab.shape', 'styleEditor.tab.presets',
  'styleEditor.quickColors', 'styleEditor.line', 'styleEditor.label', 'styleEditor.fill',
  'styleEditor.width', 'styleEditor.pattern', 'styleEditor.opacity',
  'styleEditor.copyStyle', 'styleEditor.removeStyle',
  'styleEditor.edgeNotSupported', 'styleEditor.nodeNotSupported', 'styleEditor.useThemeCSS',
  'styleEditor.edge', 'styleEditor.cluster',
  'styleEditor.patternSolid', 'styleEditor.patternDashed', 'styleEditor.patternShort',
  'styleEditor.patternDotted', 'styleEditor.patternTiny', 'styleEditor.patternDashDot',
  'colorNames.blue', 'colorNames.green', 'colorNames.red', 'colorNames.amber',
  'colorNames.violet', 'colorNames.gray', 'colorNames.pink', 'colorNames.teal',

  // stylePanel (new)
  'stylePanel.hue', 'stylePanel.preview', 'stylePanel.saturation',
  'stylePanel.brightness', 'stylePanel.warmth', 'stylePanel.shuffle',
  'stylePanel.swatchPrimary', 'stylePanel.swatchBg', 'stylePanel.swatchLine',
  'stylePanel.swatchCard', 'stylePanel.swatchText',

  // classManager (new)
  'classManager.title', 'classManager.styleClasses', 'classManager.newClassDef',
  'classManager.editClass', 'classManager.className', 'classManager.save',
  'classManager.cancel', 'classManager.createClassDef', 'classManager.assignments',
  'classManager.applyTo',

  // themeCSS (new)
  'themeCSS.title', 'themeCSS.header', 'themeCSS.presets',
  'themeCSS.clearCSS', 'themeCSS.helpText',

  // stylePresets (new)
  'stylePresets.title', 'stylePresets.header', 'stylePresets.clickElement',

  // stylingGuide
  'stylingGuide.nodeTitle', 'stylingGuide.nodeIntro', 'stylingGuide.inlineStyle',
  'stylingGuide.classDefStyle', 'stylingGuide.nodeExample',
  'stylingGuide.edgeTitle', 'stylingGuide.edgeIntro', 'stylingGuide.edgeSyntax',
  'stylingGuide.edgeIndexTitle', 'stylingGuide.edgeIndexDesc',
  'stylingGuide.dashPatterns', 'stylingGuide.patternName', 'stylingGuide.patternValue',
  'stylingGuide.patternVisual', 'stylingGuide.edgeExample',
  'stylingGuide.cssTitle', 'stylingGuide.cssIntro',
  'stylingGuide.cssNodeExample', 'stylingGuide.cssEdgeExample',
]

describe('translations completeness', () => {
  it('every used key exists in English translations', () => {
    const missing = usedKeys.filter(k => !(k in flatEn))
    expect(missing).toEqual([])
  })

  it('every used key exists in Khmer translations', () => {
    const missing = usedKeys.filter(k => !(k in flatKh))
    expect(missing).toEqual([])
  })

  it('English and Khmer have the same keys', () => {
    const enOnly = Object.keys(flatEn).filter(k => !(k in flatKh))
    const khOnly = Object.keys(flatKh).filter(k => !(k in flatEn))
    expect(enOnly).toEqual([])
    expect(khOnly).toEqual([])
  })
})
