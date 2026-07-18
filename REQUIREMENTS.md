# Requirements Document — Mermaid Live Editor

**Project Name:** Mermaid Live Editor  
**Purpose:** A browser-based interactive editor for authoring, previewing, styling, and exporting Mermaid diagrams, with full Khmer/English localization and a distraction-free view mode.  
**Target Users:** Developers, technical writers, educators, students, and Cambodian/Khmer-language users who need to create professional diagrams in a browser.

---

## 1. Tech Stack

| Layer | Tool/Tech | Version | Notes |
|---|---|---|---|
| **Frontend Framework** | React | 19 | Latest major with concurrent features |
| **Build Tool** | Vite | 6 | Fast dev server, ESBuild-based bundling |
| **UI Styling** | Tailwind CSS | 4 | Utility-first; CSS-driven config (`@theme`), no JS config file |
| **State Management** | Zustand | 5 | Lightweight store with `localStorage` persistence plugin |
| **Diagram Engine** | Mermaid | 11 | Core rendering; supports 27 diagram types |
| **Icons** | Lucide React | 0.400 | Consistent icon set across all UI elements |
| **Font Loading** | Google Fonts | — | Rubik (UI), Google Sans (code), Kantumruy Pro (Khmer) via `<link>` in `index.html` |
| **Test Runner** | Vitest | 4.1 | Jest-compatible; runs in Node with jsdom environment |
| **Coverage** | `@vitest/coverage-v8` | 4.1 | V8-based code coverage |
| **DOM Emulation** | jsdom | 29 | Test environment for React component tests |
| **CI/CD** | None configured | — | No CI pipeline files found (`.github/`, `Dockerfile`, etc.) |
| **Hosting** | Not configured | — | No hosting config in repo (static site, any provider works) |
| **Backend / Database** | None | — | Fully client-side; no server, no database |
| **Authentication** | None | — | No user accounts or auth |
| **Third-party APIs** | Google Fonts CSS API | — | Fetched at runtime for font preloading in exports |
| **Package Manager** | npm | — | `package-lock.json` present |

### Open Questions — Tech Stack
- CI/CD: No GitHub Actions or similar found. Desired? (Recommended: GitHub Pages or Cloudflare Pages deploy on push.)

---

## 2. Design System

### 2.1 Color Palette

#### Brand / Theme Colors (from `src/data/diagrams.js`)

| Token | Hex | Usage |
|---|---|---|
| **Primary** | `#6366f1` (Indigo-500) | Default diagram primary, UI accents |
| **Secondary** | `#eef2ff` (Indigo-50) | Default diagram background fill |
| **Line** | `#495057` (Gray-700) | Default diagram stroke/line color |
| **Primary Border** | `#ffffff` | Default node border (white) |
| **Primary Text** | `#212529` (Gray-900) | Default node text color |

#### Named Color Presets (`PALETTE_PRESETS`)

| Preset | Primary | Secondary | Line | Border | Text |
|---|---|---|---|---|---|
| Indigo | `#6366f1` | `#eef2ff` | `#495057` | `#ffffff` | `#212529` |
| Emerald | `#10b981` | `#d1fae5` | `#374151` | `#ffffff` | `#111827` |
| Rose | `#f43f5e` | `#ffe4e6` | `#6b7280` | `#ffffff` | `#1f2937` |
| Amber | `#f59e0b` | `#fef3c7` | `#525252` | `#ffffff` | `#171717` |
| Teal | `#14b8a6` | `#ccfbf1` | `#334155` | `#ffffff` | `#0f172a` |

#### Semantic / UI Colors (from Tailwind classes in components)

| Token | Hex (approx.) | Usage |
|---|---|---|
| **Success** | `#10b981` (Emerald-500) | Toast/success indicators, success node preset |
| **Error** | `#ef4444` (Red-500) | Error toast, failure node preset, error border |
| **Warning** | `#f59e0b` (Amber-500) | Warning toast, decision node preset |
| **Info** | `#3b82f6` (Blue-500) | Info toast |
| **UI Background (light)** | `#ffffff` | Main page, panels, toolbar |
| **UI Background (dark)** | `#18181b` (Zinc-900) | Main background in dark mode |
| **UI Border (light)** | `#e4e4e7` (Zinc-200) | Panel borders, dividers |
| **UI Border (dark)** | `#3f3f46` (Zinc-700) | Panel borders in dark mode |
| **UI Text (light)** | `#27272a` (Zinc-800) | Primary text |
| **UI Text (dark)** | `#e4e4e7` (Zinc-200) | Primary text in dark mode |
| **UI Text Muted** | `#a1a1aa` (Zinc-400) / `#71717a` (Zinc-500) | Secondary labels, hints |
| **Accent/Hover** | `#6366f1` (Indigo-500) | Resize handle hover, active tab, selection highlight |

#### Diagram-Type Default Colors (27 unique schemes)

Each of the 27 diagram types gets its own default 5-color scheme. Four base palettes are rotated across types: Indigo, Emerald, Rose, Amber, Teal (see `DEFAULT_COLORS_BY_TYPE` in `diagrams.js:110-135`).

### 2.2 Typography

| Element | Font Family | Size | Weight | Location |
|---|---|---|---|---|
| **UI Sans** | Rubik, system sans-serif | 10px–14px (Tailwind text-[10px], text-xs, text-sm) | 400, 500, 600, 700 | `:root { --font-sans }` in `index.css` |
| **UI Mono** | SF Mono, Fira Code, monospace | 10px–12px | 400 | `:root { --font-mono }` |
| **Code Editor** | Google Sans, Rubik, sans-serif | 13px (estimated) | 400–700 | `@theme { --font-code }` in `index.css` |
| **Khmer UI** | Kantumruy Pro, Rubik, sans-serif | Same as above | 400–700 | `:root:lang(km) { --font-sans }` override |
| **Khmer Code** | Google Sans, Kantumruy Pro, sans-serif | Same as above | 400–700 | `:root:lang(km) { --font-code }` override |

Uses Tailwind's default font-size scale (no custom sizes in theme). Font weights 400/500/600/700 for Rubik and Kantumruy Pro are preloaded at app startup.

### 2.3 Spacing & Sizing

- **Grid unit:** Tailwind default scale (based on 4px: `p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, etc.)
- **Panel gap (icon buttons):** `gap-0.5` (2px)–`gap-1` (4px) in toolbars
- **Section padding:** `px-3 py-1.5` (12px horizontal, 6px vertical) in toolbar/footer bars
- **Canvas padding:** `p-2 sm:p-6` (8px mobile, 24px desktop)
- **Sidebar width:** `w-56` (224px) when open; collapses to `w-0` with `overflow-hidden`
- **Editor panel:** `flex: 0 0 35%` default, or custom pixel width after drag resize (persisted)
- **Resize handle:** 4px wide with 4px invisible hit area on each side (`inset: 0 -4px`)
- **Border radius (UI):** `rounded-md` (6px Tailwind default), `rounded-lg` (8px)
- **Border radius (diagram nodes):** Configurable via `rx`/`ry` in style presets (default 5px–8px)

### 2.4 Component Library

- **Framework:** Custom React components (no third-party UI library like MUI or shadcn)
- **Base:** Tailwind CSS v4 utility classes for all styling
- **Reusable components built:** See table below

### 2.5 Reusable UI Components

| Component | File | Description |
|---|---|---|
| `Toolbar` | `Toolbar.jsx` | Top bar: sidebar toggle, diagram name, language switch, history, share, AI |
| `Sidebar` | `Sidebar.jsx` | Collapsible left panel listing 27 diagram types with search filter |
| `Editor` | `Editor.jsx` | Right panel with 3 tabs (Code, Style, Docs); code textarea with auto-detect |
| `Preview` | `Preview.jsx` | Central diagram canvas: pan/zoom, fullscreen, click-to-select, error overlay |
| `BottomBar` | `BottomBar.jsx` | Bottom bar: export actions, view mode toggle, theme/grid toggle, version info |
| `ColorPalette` | `ColorPalette.jsx` | 5 color pickers + 5 preset buttons + reset; per-diagram persistence |
| `StylePanel` | `StylePanel.jsx` | Hue slider, 4 harmony modes, 5 swatches, saturation/brightness/warmth controls |
| `StyleEditor` | `StyleEditor.jsx` | Floating panel: context-sensitive tabs for node/edge colors, text, shape, presets |
| `StylePresets` | `StylePresets.jsx` | Grid of 40+ one-click style preset tiles |
| `ClassManager` | `ClassManager.jsx` | CRUD for `classDef`; apply to selected elements; view assignments |
| `ThemeCSSEditor` | `ThemeCSSEditor.jsx` | Dropdown with 11 CSS presets + raw CSS textarea |
| `StylingGuide` | `StylingGuide.jsx` | Collapsible documentation with copyable code examples |
| `Modal` | `Modal.jsx` | Reusable modal wrapper; provides `ShareModal` and `HistoryModal` |
| `Toast` | `Toast.jsx` | Event-driven notification system (4 types, auto-dismiss, stackable) |

### 2.6 Iconography

- **Library:** Lucide React (`^0.400`) — all icons used
- **Style:** Consistent 12px–13px `size` prop in toolbars, 16px+ in content areas
- **Coverage:** 30+ unique Lucide icons used across the app

### 2.7 Responsive Breakpoints

- **sm** `640px`: Toolbar/export button labels hidden below this (`hidden sm:inline`); canvas padding increases from `p-2` to `p-6`
- **No other custom breakpoints** — relies on Tailwind defaults
- **Editor/sidebar:** Sidebar collapses via `w-0` toggle (not media-query driven)
- **Resize handle:** Touch-enabled for mobile panel resize

### 2.8 Dark Mode

- **Implementation:** CSS class `.dark` on `<html>` element toggled by Zustand store
- **Tailwind variant:** `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`
- **All components** use Tailwind `dark:` prefix for panel backgrounds, borders, text, and interactive states
- **Mermaid rendering:** `theme: 'base'` with `darkMode: true` and `background: '#1a1b1e'` for dark mode diagrams
- **Persistence:** Current theme saved to `localStorage`

### 2.9 Accessibility

| Pattern | Status | Location |
|---|---|---|
| **ARIA labels** | Partial — `title` attributes on icon buttons | All toolbar/footer buttons |
| **Keyboard nav** | Partial — `tabIndex`, `role="button"`, `onKeyDown` (Enter/Space) on `StyleRow` components | `Editor.jsx` |
| **Keyboard shortcuts** | `Ctrl+B` sidebar, `Ctrl+Shift+D` theme, `Ctrl+Enter` render, `Ctrl+S` save, `Escape` deselect | `App.jsx`, `Editor.jsx`, `Preview.jsx` |
| **Focus indicators** | Tailwind default (browser default outline) | — |
| **Color contrast** | Tailwind's built-in color scale used; not formally audited | — |
| **Screen reader labels** | Icon buttons rely on `title` attributes; no `aria-label` found | Throughout |
| **Semantic HTML** | Uses `<button>`, `<nav>` (Sidebar), `<kbd>`, etc. | Throughout |

### 2.10 Design Artifacts

- **No Figma file, Sketch file, or design token file** referenced in the repository
- **No formal style guide document** — styling conventions are implicit in Tailwind usage patterns
- **Design tokens** defined ad-hoc: CSS variables in `index.css`, color hex values in `diagrams.js` and `stylePresets.js`

### Open Questions — Design System
1. No documented brand color palette — only inferred from `DEFAULT_THEME_COLORS` (`#6366f1` indigo as primary). Is there an official brand palette we should standardize?
2. No formal spacing/sizing scale — Tailwind defaults used throughout. Should we document a canonical scale (4px base unit)?
3. No accessibility audit has been done. Required for production launch?
4. No Figma or design token file exists. Needed for future design work?

---

## 3. Features

### 3.1 Complete Feature Inventory (User Stories)

#### Category: Diagram Authoring & Editing

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-01 | As a user, I want to write Mermaid code in a text editor with syntax highlighting, so that I can create diagrams. | **Must-have** | None |
| F-02 | As a user, I want to switch between 27 diagram types with pre-filled starter code, so that I can quickly start any diagram type. | **Must-have** | F-01 |
| F-03 | As a user, I want the diagram type to be auto-detected from my code, so that I don't have to manually select it. | **Should-have** | F-01 |
| F-04 | As a user, I want my diagram code to be auto-saved to browser storage, so that I don't lose work on page reload. | **Must-have** | None |
| F-05 | As a user, I want to undo/restore previous versions of my code from a history panel, so that I can recover from mistakes. | **Should-have** | F-04 |
| F-06 | As a user, I want parentheses in node labels to be auto-fixed (quoted), so that mermaid doesn't fail to parse my diagram. | **Should-have** | F-01 |
| F-07 | As a user writing Khmer text, I want stadium nodes `([...])` with edges to render correctly, so that my Khmer diagrams don't crash. | **Should-have** | F-01 |

#### Category: Preview & Rendering

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-08 | As a user, I want a live preview that updates as I type (debounced), so that I can see my diagram in real time. | **Must-have** | F-01 |
| F-09 | As a user, I want to pan (drag) and zoom (scroll/buttons) the preview, so that I can inspect large diagrams. | **Must-have** | F-08 |
| F-10 | As a user, I want to reset the view to 100% zoom and center, so that I can quickly return to the default view. | **Should-have** | F-09 |
| F-11 | As a user, I want to go fullscreen with the preview panel, so that I can focus on the diagram. | **Could-have** | F-08 |
| F-12 | As a user, I want to see syntax errors displayed clearly on the preview, so that I can fix my code. | **Must-have** | F-08 |
| F-13 | As a user, I want a view mode that hides all editing panels, so that I can present or review the diagram without distractions. | **Should-have** | F-08 |

#### Category: Styling & Theming

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-14 | As a user, I want per-diagram 5-color themes (primary, secondary, line, background, text) with color pickers, so that my diagrams match my brand. | **Must-have** | F-08 |
| F-15 | As a user, I want a harmony palette generator (hue + 4 harmony modes) that creates a 5-color scheme, so that I can quickly find appealing color combinations. | **Should-have** | F-14 |
| F-16 | As a user, I want 5 named color presets (Indigo, Emerald, Rose, Amber, Teal) for one-click theme switching, so that I can quickly restyle my diagram. | **Should-have** | F-14 |
| F-17 | As a user, I want to toggle between light and dark mode, so that my diagrams look good in any environment. | **Must-have** | F-14 |
| F-18 | As a user, I want a grid overlay toggle on the preview canvas, so that I can align elements visually. | **Could-have** | F-08 |
| F-19 | As a user, I want to apply global CSS to the SVG diagram via a CSS editor (11 presets + custom), so that I can control every visual aspect of the rendered diagram. | **Should-have** | F-08 |

#### Category: Per-Element Styling

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-20 | As a user, I want to click any node or edge in the preview and see a floating style editor, so that I can style individual elements. | **Must-have** | F-08 |
| F-21 | As a user, I want to apply 12 style properties (fill, stroke, color, font-weight, font-size, opacity, rx/ry, etc.) to selected elements, so that I can customize appearance. | **Must-have** | F-20 |
| F-22 | As a user, I want to apply 40+ one-click element style presets (flow, color, effect, state, shape categories), so that I can quickly style nodes. | **Should-have** | F-20 |
| F-23 | As a user, I want to apply 18 edge style presets (thick, dashed, dotted, colored, animated, etc.), so that I can differentiate relationship types. | **Should-have** | F-20 |
| F-24 | As a user, I want to create reusable `classDef` styles, assign them to nodes, and manage them via a class manager panel, so that I can maintain consistent styling. | **Should-have** | F-20 |
| F-25 | As a user, I want to remove styles from a selected element, so that I can revert to defaults. | **Should-have** | F-20 |
| F-26 | As a user, I want to copy the style string of an element to clipboard, so that I can reuse it elsewhere. | **Could-have** | F-20 |
| F-27 | As a user, I want styling capabilities to be diagram-aware (e.g., no edge styling for sequence diagrams), so that I only see relevant controls. | **Should-have** | F-20, F-10 |

#### Category: Export & Share

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-28 | As a user, I want to download my diagram as SVG with embedded fonts, so that I can use it in documents and presentations. | **Must-have** | F-08 |
| F-29 | As a user, I want to download my diagram as PNG at high resolution (4x), so that I can use it in presentations and social media. | **Must-have** | F-08 |
| F-30 | As a user, I want to copy my diagram as a PNG image to the system clipboard, so that I can paste it directly into other apps. | **Should-have** | F-08 |
| F-31 | As a user, I want to copy the Markdown-encoded diagram code, so that I can embed it in documentation. | **Should-have** | F-01 |
| F-32 | As a user, I want to download the raw `.mmd` file, so that I can open it in other mermaid-compatible tools. | **Could-have** | F-01 |
| F-33 | As a user, I want to generate a shareable URL with my diagram code, so that I can share my work with others. | **Should-have** | F-01 |
| F-34 | As a user, I want Khmer fonts to render correctly in exported PNGs, so that my Khmer diagrams look professional. | **Should-have** | F-29 |
| F-35 | As a user, I want PNG exports to match the live preview pixel-for-pixel, so that what I see is what I get. | **Must-have** | F-29 |

#### Category: Internationalization

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-36 | As a Khmer-speaking user, I want the full interface in Khmer (ភាសាខ្មែរ), so that I can use the tool in my native language. | **Must-have** | None |
| F-37 | As a user, I want to switch between English and Khmer with a toolbar button, so that I can choose my preferred language. | **Must-have** | F-36 |
| F-38 | As a Khmer user, I want Kantumruy Pro font preloaded for the UI and diagram rendering, so that Khmer text displays correctly. | **Must-have** | F-36 |

#### Category: Discoverability & Onboarding

| ID | User Story | Priority | Dependencies |
|---|---|---|---|
| F-39 | As a new user, I want a built-in styling guide with examples I can copy, so that I can learn how to style diagrams. | **Should-have** | None |
| F-40 | As a user, I want "Getting Started" instructions and keyboard shortcut reference in the Docs tab, so that I can learn the tool quickly. | **Should-have** | None |
| F-41 | As a user, I want filtered search in the sidebar so that I can quickly find a diagram type by name. | **Could-have** | None |

### 3.2 Feature Dependency Graph

```
F-01 (Code Editor)
  ├── F-02 (Diagram Types)
  │     └── F-03 (Auto-detect)
  ├── F-04 (Auto-save)
  │     └── F-05 (Version History)
  ├── F-06 (Paren auto-fix)
  ├── F-07 (Khmer stadium fix)
  └── F-08 (Live Preview)
        ├── F-09 (Pan/Zoom)
        │     ├── F-10 (Reset View)
        │     └── F-11 (Fullscreen)
        ├── F-12 (Error Display)
        ├── F-13 (View Mode)
        ├── F-14 (Color Theming)
        │     ├── F-15 (Harmony Palette)
        │     ├── F-16 (Color Presets)
        │     └── F-17 (Dark Mode)
        ├── F-18 (Grid Overlay)
        ├── F-19 (Theme CSS)
        ├── F-20 (Click-to-Select)
        │     ├── F-21 (Style Properties)
        │     ├── F-22 (Node Presets)
        │     ├── F-23 (Edge Presets)
        │     ├── F-24 (Class Manager)
        │     ├── F-25 (Remove Style)
        │     ├── F-26 (Copy Style)
        │     └── F-27 (Diagram Awareness)
        ├── F-28 (SVG Export)
        ├── F-29 (PNG Export)
        │     ├── F-30 (Copy PNG)
        │     ├── F-34 (Khmer Fonts in PNG)
        │     └── F-35 (WYSIWYG Export)
        ├── F-31 (Copy Markdown)
        ├── F-32 (Raw .mmd Download)
        └── F-33 (Shareable URL)
```

---

## 4. Business Requirements

### 4.1 Primary Business Goal / KPI

| Metric | Description |
|---|---|
| **User adoption** | Number of daily/weekly active users creating and exporting diagrams |
| **Diagram output quality** | PNG/SVG exports match the live preview pixel-for-pefixel (zero reported positioning or font issues) |
| **Khmer market reach** | Successful adoption by Cambodian educators, students, and technical writers who need Khmer-language diagramming |
| **Zero-server cost** | Fully client-side architecture must remain serverless to keep operating costs at $0/month |

### 4.2 Constraints

| Constraint | Details |
|---|---|
| **Serverless** | No backend, no database, no authentication. The app must work fully in the browser. |
| **localStorage limit** | Persistence is limited to ~5MB (browser `localStorage` quota). History is capped at 30 entries. |
| **Mermaid version lock** | The app targets mermaid v11.x. Breaking changes in v12+ could require migration work. |
| **Khmer Unicode rendering** | Khmer script requires specific fonts (Kantumruy Pro or similar). Browser font support varies. |
| **Canvas taint restrictions** | Browser security model prevents reading pixels from canvases that draw cross-origin resources (affected PNG export in earlier iterations). |
| **No CI/CD** | No automated deployment pipeline. Currently manual build + deploy. |

### 4.3 Stakeholders

| Stakeholder | Role / Interest |
|---|---|
| **Developer team** | Maintains the codebase, fixes bugs, adds features |
| **Khmer-language community** | Primary target audience for i18n; educators, students, technical writers |
| **Diagram authors** | General users (developers, docs writers) who need browser-based diagram creation |
| **Open source contributors** | Potential contributors drawn to a React + Mermaid open-source tool |

### 4.4 Risks & Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| **Mermaid v12 breaking changes** | High — could break all rendering | Lock mermaid version in `package.json`; plan migration when v12 stabilizes |
| **Canvas taint regression in Chrome** | Medium — PNG export fails silently | Dual-strategy fallback (blob → data URI) already implemented; monitor Chrome updates |
| **Khmer font subset not rendering in exported PNG** | Medium — Khmer text shows as boxes in exports | Data-URI `@font-face` embedding implemented; needs testing across browsers |
| **localStorage quota exceeded** | Low — with 30 history entries | Compress older history entries or implement FIFO eviction |
| **No automated accessibility audit** | Medium — may fail compliance requirements for educational use | Plan aXe/ Lighthouse audit before launch |

### 4.5 Open Questions / Needs Clarification

1. **Hosting/deployment target?** The repo has no hosting config. Preferred: GitHub Pages, Cloudflare Pages, Netlify, or self-hosted?
2. **Brand identity:** No official brand colors, logo, or design system document found. Should we formalize one, or is the current Tailwind-based approach sufficient?
3. **CI/CD pipeline:** Is a GitHub Actions workflow desired for auto-deploy on push?
4. **PWA / offline support?** Currently no service worker or manifest. Should the app work offline (for educational settings with limited connectivity)?
5. **Analytics / telemetry?** None implemented. Desired for usage tracking?
6. **PDF export?** Currently SVG + PNG only. Needed for documents/reports?
7. **Multi-user collaboration?** Not implemented and not planned (serverless constraint). But is this a future requirement?
8. **AI features:** The "Edit with AI" button is a placeholder ("SOON"). What AI integration is planned (e.g., code generation, text-to-diagram, style suggestions)?
