# Mermaid Live Editor

Interactive Mermaid diagram editor with live preview, 26+ diagram types, per-diagram color theming, per-element styling, view mode, and Khmer/English localization.

Built with React 19, Vite 6, Tailwind CSS v4, Zustand 5, and Mermaid 11.

## Features

- **26+ diagram types** — flowchart, sequence, class, ER, state, gantt, kanban, timeline, user-journey, requirement, mindmap, architecture, block, C4, git, ishikawa, packet, pie, quadrant, radar, sankey, treeview, treemap, venn, info, eventmodeling
- **Live preview** — renders as you type; pan with click-drag, zoom with mouse wheel or buttons. Zoom/pan persist across diagram switches and color changes.
- **View mode** — distraction-free viewing: hides sidebar, editor, and floating panels. Toggle via Eye button in footer or use fullscreen.
- **Per-element styling** — click a node or edge to style it: fill, stroke, text color, font weight, border radius, dash patterns. Supports inline `style`, `classDef`/`class`, and `linkStyle` for edges.
- **Per-diagram color palette** — 5 color pickers (primary, secondary, line, background, text) with 5 presets and an HSL harmony palette generator
- **Style presets** — 12 node presets, 9 edge presets, 13 Theme CSS presets for one-click styling
- **Dark/light theme** — toggleable, persists color overrides
- **Grid toggle** — optional background grid for alignment
- **Resizable split pane** — drag to resize editor/preview split (mouse + touch)
- **Export** — PNG (4x scale with embedded data-URI fonts), SVG, raw `.mmd`, Markdown, or shareable link. PNG uses live DOM position capture for pixel-perfect rendering matching the preview.
- **Version history** — automatic snapshots with restore
- **localStorage persistence** — state survives page reloads
- **Keyboard shortcuts** — Ctrl+Enter to render, Ctrl+B to toggle sidebar, Ctrl+Shift+D to toggle dark mode
- **i18n** — English and Khmer (ភាសាខ្មែរ) language support
- **Khmer text support** — Kantumruy Pro font for Khmer glyphs; automatic `([...])` → `["..."]` workaround for mermaid v11.15 stadium+edge render bug
- **Click-to-inspect** — click any node or edge to see its ID and apply styles; highlighted selection outline
- **Style guide** — built-in documentation panel with copyable code examples for inline styles, classDef, and linkStyle
- **Hover-reveal copy buttons** — on all code blocks in the styling guide
- **AI features** — toolbar button with coming-soon indicator
- **Mermaid version** — displayed in footer bar

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Tech Stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 6 |
| Tailwind CSS | 4 |
| Zustand | 5 |
| Mermaid | 11 |
| Lucide React | Latest |
| Khmer Font | Kantumruy Pro |
| Google Fonts | Rubik, Google Sans |

## Export File Naming

Exported files follow the pattern `<diagram_type>-<datetime>.<ext>`, e.g. `flowchart-20250609-143022.svg` or `sequence-20250609-143022.png`.

## Key Modules

| Module | Purpose |
|---|---|
| `src/utils/export.js` | SVG/PNG/Markdown export; font preloading; captureLiveSvg for pixel-perfect PNG |
| `src/utils/styleParser.js` | Apply/remove `style`, `classDef`, `linkStyle` from diagram code |
| `src/utils/svgInspector.js` | Click-to-inspect on SVG; element ID extraction |
| `src/utils/fixDiagram.js` | Khmer stadium render workaround (`tryRender`, `fixKhmerStadiumNodes`) |
| `src/utils/palette.js` | HSL harmony palette generation |
| `src/utils/migrateMermaid.js` | Auto-fix parentheses in node labels for mermaid compatibility |
| `src/store/editorStore.js` | Zustand state: diagrams, history, theme, styling, view mode |
| `src/data/stylePresets.js` | Node, edge, and Theme CSS preset definitions |
