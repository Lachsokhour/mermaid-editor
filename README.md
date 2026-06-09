# Mermaid Live Editor

Interactive Mermaid diagram editor with live preview, 26+ diagram types, per-diagram color theming, and Khmer/English localization.

Built with React 19, Vite 6, Tailwind CSS v4, Zustand 5, and Mermaid 11.

## Features

- **26+ diagram types** — flowchart, sequence, class, ER, state, gantt, kanban, timeline, user-journey, requirement, mindmap, architecture, block, C4, git, ishikawa, packet, pie, quadrant, radar, sankey, treeview, treemap, venn, info, eventmodeling
- **Live preview** — renders as you type; pan with click-drag, zoom with mouse wheel or buttons. Zoom/pan persist across diagram switches and color changes.
- **Per-diagram color palette** — 5 color pickers (primary, secondary, line, background, text) with 5 presets
- **Dark/light theme** — toggleable, persists color overrides
- **Grid toggle** — optional background grid for alignment
- **Resizable split pane** — drag to resize editor/preview split
- **Export** — PNG (with embedded fonts), SVG, Markdown, or shareable link. PNG export supports Khmer and English fonts via embedded data-URI fonts.
- **Version history** — automatic snapshots with restore
- **localStorage persistence** — state survives page reloads
- **Keyboard shortcuts** — Ctrl+Enter to render, Ctrl+S to save
- **i18n** — English and Khmer (ភាសាខ្មែរ) language support
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

## Export File Naming

Exported files follow the pattern `<diagram_type>-<datetime>.<ext>`, e.g. `flowchart-20250609-143022.svg` or `sequence-20250609-143022.png`.
