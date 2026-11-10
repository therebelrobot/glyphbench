# Plan

The 12 steps, in order. Step 1 is done; everything else is open. Kept in the repo
so the plan travels with the code.

| # | Step | State |
| --- | --- | --- |
| 1 | Scaffold: workspace, TS, Vite + vitest, the four packages, the playground | done |
| 10 | **Compile spike** — hand-written 2-glyph UFO → TTF + WOFF2 inside a Web Worker | next |
| 2 | `glyph-core` document model, aligned to UFO3 + GLIF | |
| 3 | Geometry: contour ↔ SVG path, Y-flip + UPM transform, point insert/delete, handle mirroring, `cubic2quad` | partly |
| 4 | SVG editing surface: viewport (zoom/pan), paths, point + handle nodes, hit-testing, selection | partly |
| 5 | Tool registry and the tools: select/marquee, node, pen, curve, add/delete point, contour split/join | |
| 6 | Guides: metrics from fontinfo, user guides (per-glyph and global), the snapping engine | |
| 7 | Locking + constraints: inheritance, one `canMutate` guard, on-guide / hold-x / hold-y / smooth / symmetry | |
| 8 | Undo/redo at the model level, with drag coalescing | |
| 9 | Import, best-effort: opentype.js / fonteditor-core → the model; quadratic → cubic; composites → components | |
| 10 | Export + compile: UFO write, opentype.js TTF fast path, fontTools on Pyodide in a Worker, WOFF2 | |
| 11 | Round-trip harness: draw → export → `@font-face` → shape with harfbuzzjs | |
| 12 | Docs: the public API surface and an embedding guide | |

## Why the compile spike runs first

Step 10 is listed early on purpose. "Can a worker turn a UFO into a TTF *and* a
WOFF2 in the browser, fast enough to be usable" is the riskiest assumption in the
whole plan — Pyodide cold start, worker plumbing, and whether the Pyodide build
ships brotli for `fontTools.ttLib.woff2`. If that fails, the compile path changes,
not the UI. Proving it before writing a line of editor code is cheaper than
discovering it in step 10.

## Riskiest UI work, for the record

- Snapping interacting with the Y-flip. Snapping happens in font units; dragging
  happens in SVG units; the conversion is one function and must stay one function.
- Constraint conflicts (`on-guide` plus `hold-x` on a vertical guide). Resolution:
  last writer wins, and surface the conflict in the UI rather than silently
  dropping a constraint.
