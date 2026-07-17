# PNG Export - Phase 2 Tasks

## Context

PNG export converts the mermaid SVG to canvas via Blob URL `<img>`. The core problem is that mermaid v11 renders **all text** inside `<foreignObject>` (HTML-in-SVG), which **taints the canvas** when loaded as an image — the canvas becomes unreadable. Our `stripForeignObjects()` replaces each `<foreignObject>` with an SVG `<text>` element, but the current implementation has multiple gaps that produce incorrect or broken PNG output.

---

## Known Issues

### 1. Edge labels positioned at (0, 0)

**Symptom:** Edge labels like `5 kg`, `-->`, etc. appear at the top-left corner of the PNG instead of along the edge path.

**Root cause:** `findShapeCenter()` only looks for `rect`, `polygon`, `ellipse`, `circle` sibling shapes. Edge labels have a `path` sibling (the edge line), so the lookup returns `null`. The fallback uses `fo.getAttribute('x')` which is `null` for edge foreignObjects (they use `width="0" height="0"` with no x/y).

**Fix needed:**
- Handle `path` elements in `findShapeCenter()` — parse the path `d` attribute to compute midpoint
- Or: extract the `transform` attribute from the parent `<g>` to get absolute position
- Edge label foreignObjects from mermaid typically sit at the midpoint of the edge, encoded in the parent `<g transform="translate(cx, cy)">`

### 2. CSS styles not inlined onto `<text>` elements

**Symptom:** Text appears black/default-colored instead of themed colors. Font sizes may be wrong.

**Root cause:** Mermaid v11 uses a `<style>` block with scoped selectors like:
```css
#mermaid-render-1 .nodeLabel { font-size: 14px; color: #fff; }
#mermaid-render-1 .edgeLabel { font-size: 12px; color: #333; }
```
Our `extractFoStyles()` reads inline `style` attributes from div/span/p, but mermaid often puts the **effective styles in the `<style>` block** and only minimal or `!important` overrides inline. The inline styles may not contain all needed properties.

**Fix needed:**
- Parse the SVG `<style>` blocks and resolve CSS rules that match the foreignObject's ancestor classes
- Inline resolved CSS properties onto the replacement `<text>` elements
- Priority chain: inline style > `<style>` block > default

### 3. CSS custom variables not resolved

**Symptom:** `fill` attribute gets set to `var(--text-color)` which SVG renderers in `<img>` context don't resolve.

**Root cause:** `extractFoStyles()` captures the raw value from the style string, including `var(...)` references. These are CSS-only and have no meaning as SVG attributes.

**Fix needed:**
- Skip or strip `var()` values — they cannot be used as SVG attribute values
- Fall back to the `<style>` block resolution or hardcoded defaults

### 4. `rgb()` color format may not render

**Symptom:** Some renderers don't interpret `rgb(255, 255, 255)` in SVG `fill` attribute.

**Root cause:** Mermaid's computed styles use `rgb()` format (from `!important` overrides like `color: rgb(21, 87, 36) !important`). While SVG spec allows `rgb()`, some canvas rendering paths are stricter.

**Fix needed:**
- Convert `rgb(r, g, b)` to `#rrggbb` hex format for reliability

### 5. No text background/label box rendering

**Symptom:** Edge labels that normally have a white background box (`.labelBkg`) appear as bare text, making them hard to read over the edge line.

**Root cause:** Mermaid renders a `<div class="labelBkg">` inside the foreignObject for background boxes. Our code discards this and only extracts text.

**Fix needed:**
- Detect `.labelBkg` / `.edgeLabel` wrapper divs
- Render an SVG `<rect>` behind the `<text>` as a background box
- Use the div's background-color/padding style for the rect

### 6. `<text>` elements missing the parent `<g>` wrapper

**Symptom:** The replacement `<text>` is a direct child of the parent `<g>`, which may affect CSS selector matching and SVG structure expectations.

**Root cause:** `fo.parentNode.replaceChild(t, fo)` replaces the foreignObject in-place, but the original `<g>` structure may expect specific child ordering or types.

**Fix needed:**
- Wrap `<text>` (and optional background `<rect>`) in a `<g>` with appropriate class attributes
- Preserve original `data-id` attributes for consistency

### 7. `<style>` block left in SVG with stale selectors

**Symptom:** The SVG still contains `<style>` blocks referencing classes like `.nodeLabel`, `.edgeLabel`, `.labelBkg` that no longer exist in the DOM (their foreignObjects were removed). While harmless, this bloats the output and the scoped `#render-N` selectors may cause unexpected matches.

**Fix needed:**
- Remove or clean up `<style>` blocks after foreignObject stripping
- Or: inline relevant rules first, then remove the `<style>` block

### 8. Multi-line text vertical alignment for edge labels

**Symptom:** Edge labels with `<br/>` are rendered with node-style centering logic, which may be wrong for the smaller edge label context.

**Root cause:** Edge labels use a different layout context — they're smaller and positioned along paths, not centered in shapes.

**Fix needed:**
- Detect edge label foreignObjects (no x/y attributes, `width="0" height="0"`)
- Use simpler single-tspan rendering for edge labels (they're typically one line)
- Or use a smaller line-height multiplier

### 9. Sequence diagram / complex diagram text

**Symptom:** Sequence diagrams, Gantt charts, mindmaps, etc. may have text in different structures (actor names, message labels, task names) that the current node-focused logic doesn't handle.

**Root cause:** `findShapeCenter()` assumes node-like structure with sibling `rect`/`circle`. Different diagram types use different SVG structures:
- Sequence: `<rect>` for actor boxes, `<line>` for messages
- Gantt: `<rect>` for task bars, `<text>` already present
- Mindmap: `<rect>` or `<circle>` for nodes
- ER: diamond shapes for relationships

**Fix needed:**
- Handle `line`, `polyline` elements for midpoint calculation
- Handle diamond/relationship shapes
- Test across all 27 diagram types

### 10. SVG namespace re-serialization issues

**Symptom:** After `DOMParser` + `XMLSerializer`, the output may have doubled namespaces, missing attributes, or malformed elements.

**Root cause:** `DOMParser` in the browser creates an XHTML document for `image/svg+xml`, and `XMLSerializer` serializes it back. This process can alter namespace declarations, especially for `<div xmlns="...">` inside foreignObjects.

**Fix needed:**
- Post-process the serialized SVG to fix namespace issues
- Ensure `xmlns` on the root `<svg>` element is correct
- Test that the output SVG is valid and renders correctly

### 11. `!important` flag in extracted styles

**Status:** Partially handled — the regex `([^;!]+)` stops at `!` before `important`, so values are extracted correctly. But edge cases may exist with values containing `!`.

**Fix needed:**
- Verify all style extraction regexes handle `!important` correctly
- Add test cases for various `!important` patterns

### 12. Background color not extracted from foreignObject

**Symptom:** Nodes that normally have colored backgrounds (from `classDef fill:...`) lose their background in PNG.

**Root cause:** The `fill` color on the `<rect>` sibling is preserved, but in some cases the foreignObject's div has `background-color` that should also be preserved or the rect fill is not correctly inherited.

**Fix needed:**
- Ensure the sibling `<rect>` fill is preserved (it should be, since we don't modify rects)
- If the background comes from CSS (not inline), resolve it from the `<style>` block

---

## Implementation Plan

### Phase 2A: Fix edge label positioning (Priority: HIGH)
1. Add `path` midpoint calculation to `findShapeCenter()`
2. Also try extracting position from parent `<g transform="translate(...)">` as fallback
3. Handle `width="0" height="0"` foreignObjects specially

### Phase 2B: CSS style resolution (Priority: HIGH)
1. Parse `<style>` blocks from the SVG
2. Build a simple CSS rule matcher for class-based selectors
3. Merge resolved CSS with inline styles (inline wins)
4. Strip `var()` values
5. Convert `rgb()` to hex

### Phase 2C: Label backgrounds and wrapping (Priority: MEDIUM)
1. Detect `.labelBkg` wrappers and render background `<rect>` elements
2. Wrap replacement text in `<g>` with preserved class/data-id attributes
3. Clean up stale `<style>` blocks

### Phase 2D: Diagram-type coverage (Priority: MEDIUM)
1. Test and fix all 27 diagram types
2. Handle diagram-specific structures (sequence actors, ER diamonds, etc.)
3. Add diagram-type detection from SVG structure

### Phase 2E: Polish and edge cases (Priority: LOW)
1. Fix namespace re-serialization issues
2. Handle RTL text (Khmer)
3. Optimize for large diagrams
4. Add comprehensive test coverage with real mermaid renders

---

## Testing Strategy

- Unit tests with hand-crafted SVG matching real mermaid v11 output structure
- Integration tests: render a diagram with `mermaid.render()`, then run `stripForeignObjects()`, verify output SVG structure
- Visual regression: compare PNG output against expected screenshots (manual)
- Test matrix: all 27 diagram types × common edge cases (multi-line, special chars, custom styles)

---

## Files to Modify

- `src/utils/export.js` — `stripForeignObjects()`, `findShapeCenter()`, `extractFoStyles()`, `getFoTextLines()`
- `src/__tests__/export.test.js` — Add tests for edge labels, CSS resolution, various diagram types
- `src/__tests__/svg-structure.test.js` — Analyze real mermaid SVG output structure
