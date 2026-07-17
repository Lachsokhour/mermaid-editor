export const FLOWCHART_PRESETS = [
  {
    id: 'start',
    name: 'Start',
    shape: 'rect',
    category: 'flow',
    description: 'Entry point',
    styles: { fill: '#10b981', stroke: '#059669', color: '#ffffff', 'font-weight': 'bold', rx: '8', ry: '8' },
  },
  {
    id: 'process',
    name: 'Process',
    shape: 'rect',
    category: 'flow',
    description: 'Standard step',
    styles: { fill: '#e0e7ff', stroke: '#6366f1', color: '#312e81' },
  },
  {
    id: 'decision',
    name: 'Decision',
    shape: 'diamond',
    category: 'flow',
    description: 'Yes/No question',
    styles: { fill: '#fef3c7', stroke: '#d97706', color: '#92400e', 'font-weight': 'bold' },
  },
  {
    id: 'success',
    name: 'Success',
    shape: 'rect',
    category: 'flow',
    description: 'Positive outcome',
    styles: { fill: '#d1fae5', stroke: '#059669', color: '#065f46', 'font-weight': 'bold' },
  },
  {
    id: 'failure',
    name: 'Failure',
    shape: 'rect',
    category: 'flow',
    description: 'Error or negative',
    styles: { fill: '#fee2e2', stroke: '#dc2626', color: '#991b1b', 'font-weight': 'bold' },
  },
  {
    id: 'action',
    name: 'Action',
    shape: 'rect',
    category: 'flow',
    description: 'Fix or remediation',
    styles: { fill: '#ffedd5', stroke: '#ea580c', color: '#9a3412', 'font-weight': 'bold' },
  },
  {
    id: 'connector',
    name: 'Connector',
    shape: 'circle',
    category: 'flow',
    description: 'Loop-back point',
    styles: { fill: '#f1f5f9', stroke: '#94a3b8', color: '#475569', 'stroke-dasharray': '4 2' },
  },
  {
    id: 'data',
    name: 'Data',
    shape: 'cylinder',
    category: 'flow',
    description: 'Database or storage',
    styles: { fill: '#dbeafe', stroke: '#2563eb', color: '#1e40af' },
  },
  {
    id: 'subroutine',
    name: 'Subroutine',
    shape: 'rect',
    category: 'flow',
    description: 'Predefined process',
    styles: { fill: '#ede9fe', stroke: '#7c3aed', color: '#5b21b6', 'stroke-dasharray': '8 4' },
  },
]

export const EDGE_STYLE_PRESETS = [
  {
    id: 'default',
    name: 'Default',
    styles: {},
  },
  {
    id: 'thick',
    name: 'Thick',
    styles: { 'stroke-width': '3px' },
  },
  {
    id: 'dashed',
    name: 'Dashed',
    styles: { 'stroke-dasharray': '8 4' },
  },
  {
    id: 'dotted',
    name: 'Dotted',
    styles: { 'stroke-dasharray': '3 3' },
  },
  {
    id: 'bold-green',
    name: 'Green',
    styles: { stroke: '#10b981', 'stroke-width': '2px' },
  },
  {
    id: 'bold-red',
    name: 'Red',
    styles: { stroke: '#ef4444', 'stroke-width': '2px' },
  },
  {
    id: 'bold-blue',
    name: 'Blue',
    styles: { stroke: '#3b82f6', 'stroke-width': '2px' },
  },
  {
    id: 'dashed-red',
    name: 'Dashed Red',
    styles: { stroke: '#ef4444', 'stroke-dasharray': '8 4' },
  },
  {
    id: 'animated',
    name: 'Animated',
    styles: { 'stroke-dasharray': '9 5', animation: 'edge-animation 1s linear infinite' },
  },
  {
    id: 'thin',
    name: 'Thin',
    styles: { 'stroke-width': '1px' },
  },
  {
    id: 'dash-dot',
    name: 'Dash Dot',
    styles: { 'stroke-dasharray': '8 4 2 4' },
  },
  {
    id: 'thick-dashed',
    name: 'Thick Dashed',
    styles: { 'stroke-dasharray': '8 4', 'stroke-width': '3px' },
  },
  {
    id: 'bold-orange',
    name: 'Orange',
    styles: { stroke: '#f97316', 'stroke-width': '2px' },
  },
  {
    id: 'bold-purple',
    name: 'Purple',
    styles: { stroke: '#8b5cf6', 'stroke-width': '2px' },
  },
  {
    id: 'dashed-green',
    name: 'Dashed Green',
    styles: { stroke: '#10b981', 'stroke-dasharray': '8 4' },
  },
  {
    id: 'dashed-blue',
    name: 'Dashed Blue',
    styles: { stroke: '#3b82f6', 'stroke-dasharray': '8 4' },
  },
  {
    id: 'dashed-orange',
    name: 'Dashed Orange',
    styles: { stroke: '#f97316', 'stroke-dasharray': '8 4' },
  },
  {
    id: 'dashed-purple',
    name: 'Dashed Purple',
    styles: { stroke: '#8b5cf6', 'stroke-dasharray': '8 4' },
  },
]

export const ELEMENT_STYLE_PRESETS = [
  ...FLOWCHART_PRESETS,
  {
    id: 'purple',
    name: 'Purple',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#8b5cf6', stroke: '#7c3aed', color: '#ffffff' },
  },
  {
    id: 'pink',
    name: 'Pink',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#ec4899', stroke: '#db2777', color: '#ffffff' },
  },
  {
    id: 'cyan',
    name: 'Cyan',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#06b6d4', stroke: '#0891b2', color: '#ffffff' },
  },
  {
    id: 'slate',
    name: 'Slate',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#64748b', stroke: '#475569', color: '#ffffff' },
  },
  {
    id: 'amber',
    name: 'Amber',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#f59e0b', stroke: '#d97706', color: '#ffffff' },
  },
  {
    id: 'teal',
    name: 'Teal',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#14b8a6', stroke: '#0d9488', color: '#ffffff' },
  },
  {
    id: 'red',
    name: 'Red',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#ef4444', stroke: '#dc2626', color: '#ffffff' },
  },
  {
    id: 'orange',
    name: 'Orange',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#f97316', stroke: '#ea580c', color: '#ffffff' },
  },
  {
    id: 'lime',
    name: 'Lime',
    shape: 'rect',
    category: 'color',
    styles: { fill: '#84cc16', stroke: '#65a30d', color: '#ffffff' },
  },
  {
    id: 'glass',
    name: 'Glass',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#ffffff', stroke: '#e2e8f0', color: '#1e293b', 'stroke-width': '2px' },
  },
  {
    id: 'dark',
    name: 'Dark',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#1e293b', stroke: '#334155', color: '#f8fafc' },
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#022c22', stroke: '#34d399', color: '#34d399', 'stroke-width': '2px' },
  },
  {
    id: 'neon-blue',
    name: 'Neon Blue',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#0c1445', stroke: '#60a5fa', color: '#60a5fa', 'stroke-width': '2px' },
  },
  {
    id: 'outline',
    name: 'Outline',
    shape: 'rect',
    category: 'effect',
    styles: { fill: 'transparent', stroke: '#334155', color: '#334155', 'stroke-width': '2px' },
  },
  {
    id: 'dashed-border',
    name: 'Dashed',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#f8fafc', stroke: '#94a3b8', color: '#475569', 'stroke-dasharray': '5 5' },
  },
  {
    id: 'rounded',
    name: 'Rounded',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#6366f1', stroke: '#4f46e5', color: '#ffffff', rx: '12', ry: '12' },
  },
  {
    id: 'gradient-warm',
    name: 'Warm',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#fef3c7', stroke: '#f59e0b', color: '#92400e', 'stroke-width': '2px' },
  },
  {
    id: 'gradient-cool',
    name: 'Cool',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#dbeafe', stroke: '#3b82f6', color: '#1e40af', 'stroke-width': '2px' },
  },
  {
    id: 'gradient-rose',
    name: 'Rose',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#ffe4e6', stroke: '#f43f5e', color: '#9f1239', 'stroke-width': '2px' },
  },
  {
    id: 'gradient-emerald',
    name: 'Emerald',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#d1fae5', stroke: '#10b981', color: '#065f46', 'stroke-width': '2px' },
  },
  {
    id: 'gradient-violet',
    name: 'Violet',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#ede9fe', stroke: '#8b5cf6', color: '#5b21b6', 'stroke-width': '2px' },
  },
  {
    id: 'thick-border',
    name: 'Thick',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#ffffff', stroke: '#1e293b', color: '#1e293b', 'stroke-width': '3px' },
  },
  {
    id: 'no-fill',
    name: 'No Fill',
    shape: 'rect',
    category: 'effect',
    styles: { fill: 'none', stroke: '#94a3b8', color: '#475569' },
  },
  {
    id: 'shadow-lg',
    name: 'Shadow',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#ffffff', stroke: '#e2e8f0', color: '#1e293b', 'stroke-width': '1px', opacity: '0.95' },
  },
  {
    id: 'dashed-thick',
    name: 'Dash Thick',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#f8fafc', stroke: '#64748b', color: '#334155', 'stroke-dasharray': '8 4', 'stroke-width': '2px' },
  },
  {
    id: 'state-start',
    name: 'Start State',
    shape: 'circle',
    category: 'state',
    styles: { fill: '#10b981', stroke: '#059669', color: '#ffffff' },
  },
  {
    id: 'state-end',
    name: 'End State',
    shape: 'circle',
    category: 'state',
    styles: { fill: '#ef4444', stroke: '#dc2626', color: '#ffffff', 'stroke-width': '3px' },
  },
  {
    id: 'state-choice',
    name: 'Choice',
    shape: 'diamond',
    category: 'state',
    styles: { fill: '#fef3c7', stroke: '#d97706', color: '#92400e' },
  },
  {
    id: 'note',
    name: 'Note',
    shape: 'rect',
    category: 'shape',
    styles: { fill: '#fef9c3', stroke: '#eab308', color: '#854d0e', rx: '4', ry: '4' },
  },
  {
    id: 'input-output',
    name: 'Input/Output',
    shape: 'parallelogram',
    category: 'shape',
    styles: { fill: '#dbeafe', stroke: '#3b82f6', color: '#1e40af' },
  },
  {
    id: 'document',
    name: 'Document',
    shape: 'rect',
    category: 'shape',
    styles: { fill: '#fff7ed', stroke: '#ea580c', color: '#9a3412' },
  },
  {
    id: 'database',
    name: 'Database',
    shape: 'cylinder',
    category: 'shape',
    styles: { fill: '#e0e7ff', stroke: '#6366f1', color: '#312e81' },
  },
  {
    id: 'warning',
    name: 'Warning',
    shape: 'rect',
    category: 'state',
    styles: { fill: '#fef2f2', stroke: '#ef4444', color: '#991b1b', 'stroke-width': '2px', 'stroke-dasharray': '4 2' },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    shape: 'rect',
    category: 'shape',
    styles: { fill: '#1e293b', stroke: '#475569', color: '#22c55e', 'font-family': 'monospace', rx: '6', ry: '6' },
  },
  {
    id: 'cloud',
    name: 'Cloud',
    shape: 'circle',
    category: 'shape',
    styles: { fill: '#e0f2fe', stroke: '#0284c7', color: '#0c4a6e', 'stroke-dasharray': '4 2' },
  },
  {
    id: 'highlight',
    name: 'Highlight',
    shape: 'rect',
    category: 'effect',
    styles: { fill: '#fef9c3', stroke: '#eab308', color: '#854d0e', 'stroke-width': '3px' },
  },
]

export const THEME_CSS_PRESETS = [
  {
    id: 'default',
    name: 'Default',
    css: '',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  fill: rgba(255, 255, 255, 0.25) !important;
  stroke: rgba(255, 255, 255, 0.4) !important;
  stroke-width: 1px !important;
  filter: blur(0px);
  backdrop-filter: blur(10px);
}
.edgeLabel {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border-radius: 4px;
  padding: 2px 4px;
}`,
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 12px currentColor);
}
.edgeLabel {
  filter: drop-shadow(0 0 4px currentColor);
}
.edgePath .path {
  filter: drop-shadow(0 0 3px currentColor);
}`,
  },
  {
    id: 'hand-drawn',
    name: 'Hand Drawn',
    css: `.node rect {
  rx: 3 !important;
  ry: 3 !important;
  stroke-width: 2px !important;
}
.edgePath .path {
  stroke-width: 2px !important;
}
.node polygon {
  stroke-width: 2px !important;
}`,
  },
  {
    id: 'flat',
    name: 'Flat',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  stroke: none !important;
  stroke-width: 0 !important;
  filter: none !important;
}
.edgePath .path {
  stroke-width: 2px !important;
}
.edgeLabel {
  background-color: transparent !important;
}`,
  },
  {
    id: 'shadow',
    name: 'Drop Shadow',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.15));
}
.edgeLabel {
  filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.1));
}`,
  },
  {
    id: 'bold-edges',
    name: 'Bold Edges',
    css: `.edgePath .path {
  stroke-width: 3px !important;
}
.edgeLabel {
  font-weight: bold !important;
  font-size: 14px !important;
}
.arrowheadPath {
  stroke-width: 3px !important;
}`,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  fill: transparent !important;
  stroke: #94a3b8 !important;
  stroke-width: 1px !important;
}
.edgePath .path {
  stroke: #cbd5e1 !important;
  stroke-width: 1px !important;
}
.edgeLabel {
  background-color: transparent !important;
}`,
  },
  {
    id: 'rounded-modern',
    name: 'Rounded Modern',
    css: `.node rect {
  rx: 16 !important;
  ry: 16 !important;
  stroke-width: 2px !important;
}
.cluster rect {
  rx: 12 !important;
  ry: 12 !important;
}
.edgeLabel {
  border-radius: 8px;
  padding: 2px 6px;
}`,
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  fill: #1e293b !important;
  stroke: #475569 !important;
  color: #f1f5f9 !important;
}
.nodeLabel {
  color: #f1f5f9 !important;
}
.edgeLabel {
  background-color: #1e293b !important;
  color: #cbd5e1 !important;
  border: 1px solid #334155 !important;
}
.edgePath .path {
  stroke: #64748b !important;
}
.cluster rect {
  fill: #0f172a !important;
  stroke: #334155 !important;
}
.cluster-label {
  color: #94a3b8 !important;
}`,
  },
  {
    id: 'colorful',
    name: 'Colorful',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  stroke-width: 2px !important;
}
.edgePath .path {
  stroke: #6366f1 !important;
  stroke-width: 2px !important;
}
.edgeLabel {
  background: linear-gradient(135deg, #eef2ff, #fef3c7) !important;
  border: 1px solid #c7d2fe !important;
  border-radius: 6px !important;
  padding: 2px 6px !important;
  font-weight: 500 !important;
}
.cluster rect {
  fill: #f8fafc !important;
  stroke: #cbd5e1 !important;
  stroke-dasharray: 4 2 !important;
}
.marker {
  fill: #6366f1 !important;
}`,
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  stroke-width: 2px !important;
  filter: saturate(1.3) !important;
}
.edgePath .path {
  stroke-width: 2.5px !important;
}
.edgeLabel {
  font-weight: 600 !important;
  font-size: 13px !important;
}
.cluster rect {
  fill: transparent !important;
  stroke: #94a3b8 !important;
}`,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    css: `.node rect, .node polygon, .node circle, .node ellipse {
  fill: #ffffff !important;
  stroke: #000000 !important;
  color: #000000 !important;
  stroke-width: 1.5px !important;
}
.nodeLabel {
  color: #000000 !important;
  font-weight: normal !important;
}
.edgeLabel {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
}
.edgePath .path {
  stroke: #000000 !important;
}
.cluster rect {
  fill: #fafafa !important;
  stroke: #000000 !important;
  stroke-dasharray: 2 2 !important;
}
.cluster-label {
  color: #000000 !important;
  font-weight: bold !important;
}`,
  },
]
