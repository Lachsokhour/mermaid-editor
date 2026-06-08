# Mermaid Live Editor

Interactive Mermaid diagram editor with live preview, 26 diagram types, and per-diagram color theming.

Built with React 19, Vite 6, Tailwind CSS v4, Zustand 5, and Mermaid 11.

## Features

- **26 diagram types** — flowchart, sequence, class, ER, state, gantt, kanban, timeline, user-journey, requirement, mindmap, architecture, block, C4, git, ishikawa, packet, pie, quadrant, radar, sankey, treeview, treemap, venn, info, eventmodeling
- **Live preview** — renders as you type; pan with click-drag, zoom with mouse wheel or buttons
- **Per-diagram color palette** — 5 color pickers (primary, secondary, line, background, text) with 5 presets
- **Dark/light theme** — toggleable, persists color overrides
- **Grid toggle** — optional background grid for alignment
- **Resizable split pane** — drag to resize editor/preview split
- **Export** — PNG, SVG, Markdown, or shareable link
- **Version history** — automatic snapshots with restore
- **localStorage persistence** — state survives page reloads
- **Keyboard shortcuts** — Ctrl+Enter to render, Ctrl+S to save

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
