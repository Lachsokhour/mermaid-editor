# Deep Analysis: Per-Element Styling for All Diagram Types

## Current State Summary

### What Works (Flowchart/Class/State/ER)
- Click-to-select nodes and edges in SVG preview
- Per-element style editor (colors, text, shape, presets)
- `style nodeId ...` for one-off inline styles
- `classDef` / `class` for reusable styles
- `linkStyle N ...` for individual edge styling
- Chained edges correctly indexed (`A --> B --> C` = 2 edges)
- Edge hit areas (12px invisible path for easier clicking)
- Subgraph cluster styling via `style CLUSTER_NAME ...`

### Architecture
- `_mutateCode()` in store → single history-tracked mutation path
- `extractEdgeIndex(code, fromId, toId)` counts edges in doc order, handles chains
- `extractEdges(code)` returns all `{from, to, label}` tuples
- SVG click handler enriches edge data with `edgeIndex` from code parsing
- `extractNodeId(dataId)` strips `mermaid-render-\d+-` prefix + diagram type prefix + trailing `-\d+` edge suffix

## Gap Analysis by Diagram Type

### 1. Flowchart (`graph TD` / `flowchart TD`) — FULL SUPPORT ✅
- Nodes have `g[data-id]` with `data-id="flowchart-A"`
- Edges have `g.edgePath` with `data-id="L-A-B-0"` or similar
- `style`, `classDef`, `class`, `linkStyle` all work
- Subgraph clusters: `g.cluster` with `data-id="flowchart-cluster-POOL"`
- **Gaps**: None significant. `extractNodeId` handles `flowchart-` prefix correctly.

### 2. Class Diagram — FULL SUPPORT ✅
- Classes render as `g.node` with labels
- Relationships (arrows) render as `g.edgePath`
- `style`, `classDef`, `class` all work
- **Gaps**: None significant. `extractNodeId` handles `classDiagram-` prefix.

### 3. State Diagram — FULL SUPPORT ✅
- States render as `g.node` with `data-id`
- Transitions render as `g.edgePath`
- `style`, `classDef`, `class` all work
- **Gaps**: None significant. `extractNodeId` handles `stateDiagram-` prefix.

### 4. ER Diagram — FULL SUPPORT ✅
- Entities render as `g.node` (or `g.cluster` for attributes)
- Relationships render as `g.edgePath`
- `style`, `classDef`, `class` all work
- **Gaps**: None significant. `extractNodeId` handles `erDiagram-` prefix.

### 5. Sequence Diagram — PARTIAL SUPPORT ⚠️
- Actors/participants render as `g.actor` (NOT `g.node`) — **MISSING from click selectors**
- Messages render as `g.line` or `g.messageLine` (NOT `g.edgePath`) — **MISSING from click selectors**
- `style` works for actors: `style Alice fill:#f00`
- `classDef`/`class` works for actors
- `linkStyle` does NOT work (messages aren't edges in the flowchart sense)
- **Gaps**:
  - Click selectors don't match `g.actor`, `g.messageLine`, `g.messageText`
  - `extractNodeId` strips `sequence-` prefix, but actor data-id format is `sequence-ParticipantName-0`
  - Message styling requires different approach (Mermaid doesn't support `linkStyle` for sequence diagrams)

### 6. Mindmap — LIMITED SUPPORT ⚠️
- Nodes render as `g.node` with `data-id`
- No edges/arrows (it's a tree structure)
- `style` works: `style Root fill:#f00`
- `classDef`/`class` works
- **Gaps**:
  - `extractNodeId` strips `mindmap-` prefix, but node IDs are often auto-generated
  - Node IDs in mindmap are like `mindmap-root`, `mindmap-root-child-0`, etc.
  - The `extractNodeId` function strips trailing `-\d+`, so `root-child-0` becomes `root-child` (may be wrong)

### 7. Gantt — NO SUPPORT ❌
- No clickable elements (rendered as a table/chart)
- No `style`/`classDef`/`class` support in Mermaid
- **Gaps**: Entire diagram type has no per-element styling. Should show "not supported" message.

### 8. Pie Chart — NO SUPPORT ❌
- Slices render as SVG paths but no `data-id` attributes
- No `style`/`classDef`/`class` support in Mermaid
- **Gaps**: Entire diagram type has no per-element styling. Should show "not supported" message.

### 9. Timeline — LIMITED SUPPORT ⚠️
- Events render as `g.node` with `data-id`
- `style` works for events
- **Gaps**:
  - Node IDs are auto-generated, hard to predict
  - Limited styling options

### 10. User Journey — LIMITED SUPPORT ⚠️
- Tasks render as `g.node` with `data-id`
- `style` works for tasks
- **Gaps**:
  - Node IDs are auto-generated

### 11. Architecture — LIMITED SUPPORT ⚠️
- Services render as `g.node` with `data-id`
- Connections render as `g.edgePath`
- **Gaps**:
  - `style` works for services
  - `linkStyle` may work for connections
  - Need to verify `extractNodeId` handles `architecture-` prefix

### 12. Block — LIMITED SUPPORT ⚠️
- Blocks render as `g.node` with `data-id`
- **Gaps**:
  - `style` works for blocks
  - No edges/arrows in block diagrams

### 13. C4 — LIMITED SUPPORT ⚠️
- Components render as `g.node` with `data-id`
- Relationships render as `g.edgePath`
- **Gaps**:
  - `style` works for components
  - Need to verify `extractNodeId` handles `c4-` prefix

### 14. Git Graph — NO SUPPORT ❌
- Commits render as dots (SVG circles)
- Branches are lines
- **Gaps**: No `style`/`classDef`/`class` support in Mermaid

### 15. Ishikawa — NO SUPPORT ❌
- Fishbone diagram has no standard styling support
- **Gaps**: No per-element styling in Mermaid

### 16. Packet — NO SUPPORT ❌
- Packet diagram has no standard styling support
- **Gaps**: No per-element styling in Mermaid

### 17. Quadrant — LIMITED SUPPORT ⚠️
- Points render as SVG elements
- **Gaps**: Limited styling options

### 18. Radar — NO SUPPORT ❌
- Radar chart has no standard styling support
- **Gaps**: No per-element styling in Mermaid

### 19. Sankey — NO SUPPORT ❌
- Sankey diagram has no standard styling support
- **Gaps**: No per-element styling in Mermaid

### 20. Kanban — NO SUPPORT ❌
- Kanban board has no standard styling support
- **Gaps**: No per-element styling in Mermaid

### 21. Requirement — LIMITED SUPPORT ⚠️
- Requirements and elements render as `g.node` with `data-id`
- Relationships render as `g.edgePath`
- **Gaps**:
  - `style` works for requirements/elements
  - Need to verify `extractNodeId` handles `requirement-` prefix

### 22. Info — NO SUPPORT ❌
- Info diagram has no standard styling support
- **Gaps**: No per-element styling in Mermaid

### 23. Event Modeling — NO SUPPORT ❌
- Event modeling has no standard styling support
- **Gaps**: No per-element styling in Mermaid

## Critical Issues Found

### Issue 1: Click Selectors Don't Cover All Diagram Types
**Location**: `svgInspector.js` — `addClickHandlers()` and `inspectSvgElements()`
**Problem**: Only queries for `g[data-id], g.node, g.edgePath, g.edge`. Sequence diagrams use `g.actor`, `g.messageLine`, `g.line`.
**Fix**: Add `g.actor`, `g.messageLine`, `g.line`, `g.loop`, `g.alt`, `g.opt` to selectors.

### Issue 2: extractNodeId Doesn't Handle All Prefixes
**Location**: `svgInspector.js` — `extractNodeId()`
**Problem**: Only strips `flowchart-`, `sequence-`, `classDiagram-`, `stateDiagram-`, `erDiagram-`, `gitGraph-`, `block-`, `c4-`, `architecture-`, `gantt-`, `mindmap-`, `requirement-`, `quadrant-`, `sankey-`, `radar-`, `packet-`, `pie-`, `ishikawa-`, `kanban-`, `timeline-`, `journey-`, `venn-`, `wardley-`, `info-`, `eventmodeling-`
**Status**: Actually looks complete. But the trailing `-\d+` strip is aggressive.

### Issue 3: Trailing Digit Strip Too Aggressive
**Location**: `svgInspector.js` — `extractNodeId()`
**Problem**: `id.replace(/-(\d+)$/, '')` strips trailing numbers. For node IDs like `A-1` (a real node), this strips the `1`.
**Fix**: Only strip trailing digits if the original `data-id` had a diagram type prefix (indicating it's an auto-generated ID).

### Issue 4: Edge Index Mismatch for Sequence Diagrams
**Location**: `Preview.jsx` — edge click handler
**Problem**: `extractEdgeIndex` only parses flowchart-style arrows (`-->`, `---`, etc.). Sequence diagrams use `->>`, `-->>`, `-)`, etc.
**Fix**: Extend `extractEdgeIndex` and `extractEdges` to parse sequence diagram arrow syntax.

### Issue 5: No "Not Supported" Feedback
**Location**: `StyleEditor.jsx`
**Problem**: When a user clicks an element in an unsupported diagram type, the editor shows but controls may not work.
**Fix**: Show a "Styling not supported for this diagram type" message for unsupported types.

### Issue 6: Cluster/Subgraph Styling
**Location**: `StyleEditor.jsx` — tabs
**Problem**: When a cluster/subgraph is selected, it shows node tabs (colors/text/shape). Clusters should have a simpler set.
**Fix**: Detect cluster selection and show appropriate controls.

## Implementation Plan

### Phase 1: Fix Core SVG Parsing (All Diagram Types)

#### 1.1 Update click selectors in svgInspector.js
- Add `g.actor`, `g.messageLine`, `g.line`, `g.loop`, `g.alt`, `g.opt`, `g.rect`, `g.circle` to interactive selectors
- This enables clicking on sequence diagram elements, timeline events, etc.

#### 1.2 Fix extractNodeId trailing digit strip
- Only strip trailing `-\d+` when the data-id contains a diagram type prefix
- Preserve node IDs that are naturally numbered (like `A-1`)

#### 1.3 Extend arrow pattern regex for sequence/class diagrams
- Add sequence arrow patterns: `->>`, `-->>`, `-)`, `--x`, `--)*`, etc.
- Add class diagram patterns: `<|--`, `*--`, `o--`, `-->`, etc.
- This ensures `extractEdgeIndex` and `extractEdges` work for all diagram types

### Phase 2: Diagram-Aware Styling

#### 2.1 Create diagram capabilities map
```js
const DIAGRAM_CAPABILITIES = {
  flowchart: { nodes: true, edges: true, clusters: true, classDef: true, linkStyle: true },
  class: { nodes: true, edges: true, clusters: false, classDef: true, linkStyle: false },
  state: { nodes: true, edges: true, clusters: true, classDef: true, linkStyle: false },
  'entity-relationship': { nodes: true, edges: true, clusters: false, classDef: true, linkStyle: false },
  sequence: { nodes: true, edges: false, clusters: false, classDef: true, linkStyle: false },
  mindmap: { nodes: true, edges: false, clusters: false, classDef: true, linkStyle: false },
  gantt: { nodes: false, edges: false, clusters: false, classDef: false, linkStyle: false },
  pie: { nodes: false, edges: false, clusters: false, classDef: false, linkStyle: false },
  // ... etc
}
```

#### 2.2 Filter StyleEditor tabs based on capabilities
- If `edges: false`, don't show edge styling tab
- If `classDef: false`, hide classDef manager
- If nothing is supported, show "not supported" message

#### 2.3 Add diagram-specific presets
- Sequence diagram presets (actor colors, message styles)
- State diagram presets (state colors, transition styles)
- ER diagram presets (entity colors, relationship styles)

### Phase 3: Sequence Diagram Support

#### 3.1 Parse sequence diagram elements
- Extract actor IDs from `participant` declarations
- Parse message syntax for edge styling
- Map SVG `data-id` to code IDs

#### 3.2 Add sequence-specific style controls
- Actor box styling (fill, stroke, text)
- Message line styling (color, dash pattern)
- Note styling

### Phase 4: Mindmap Support

#### 4.1 Fix mindmap node ID extraction
- Mindmap nodes have hierarchical IDs like `root-child-0`
- Need to preserve the full hierarchy for styling

#### 4.2 Add mindmap-specific presets
- Root node, branch, leaf presets
- Color gradients for hierarchy levels

### Phase 5: Edge Cases & Polish

#### 5.1 Handle subgraph styling in StyleEditor
- When cluster is selected, show cluster-specific controls
- Support `style CLUSTER_NAME ...` syntax

#### 5.2 Handle empty/missing edgeIndex
- When edgeIndex is -1 (not found in code), show "add edge style" button
- Auto-generate `linkStyle N` statement when user styles an edge

#### 5.3 Keyboard shortcuts
- `Delete` key to remove style from selected element
- `Escape` to deselect (already implemented)

#### 5.4 Visual feedback
- Show which diagram type is active and what styling is supported
- Dim unsupported controls for current diagram type
