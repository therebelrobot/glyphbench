# glyphbench

React component for building font glyphs.

An agnostic, in-browser glyph builder: a headless core plus a real SVG editing
surface. Not a font editor with opinions about your workflow — a set of parts you
can embed in your own tool, whether that tool makes a text face, an icon set, or a
wordmark.

## Status

Step 1 of 12: the workspace is scaffolded and wired end to end (core model →
editor component → playground). Nothing here is a public API yet — every package
is `0.0.0` and `private`.

Working:

- `glyph-core` serialises a contour to SVG path data (linear + cubic, with the
  Y-flip).
- `glyph-editor` renders one glyph as real SVG, with guides and the advance width.
- `apps/playground` draws a demo glyph in the browser.

Not built yet: editing and tools, snapping, locking and constraints, the UFO
reader, and the Pyodide compile worker. See [PLAN.md](./PLAN.md).

## Layout

| Path | What it is |
| --- | --- |
| `packages/glyph-core` | The document model and geometry. **No DOM, no React.** |
| `packages/glyph-editor` | React: the SVG editing surface. |
| `packages/glyph-io` | Importers and exporters (UFO/GLIF, TTF, WOFF2). |
| `packages/glyph-build` | The fontTools-on-Pyodide Web Worker. |
| `apps/playground` | Dev harness. The only place a demo lives. |

## Decisions

These are load-bearing. Changing one is a conversation, not a commit.

1. **Cubic only.** One internal curve type, normalised on import, `cubic2quad` on
   TTF export. An authoring tool, not font surgery: hints and non-outline tables
   are dropped on round-trip, deliberately and loudly.
2. **Font units, Y-up.** UFO convention. Anything that draws flips, and the flip
   happens in exactly one place.
3. **UFO3/GLIF is the canonical document.** The model is shaped so serialising to
   a `.glif` is mechanical — including guidelines, which the UFO spec already
   defines (font-level and glyph-level, with name, angle and colour).
4. **Real SVG DOM for the editing surface**, not canvas. The editable outline *is*
   the artifact. Canvas is only for previews (waterfall, kerning grid).
5. **One mutation guard.** Locks inherit document → layer → contour → point and
   are enforced in `glyph-core`, never per-tool. Locking is a special case of a
   constraint, not a separate mechanism.
6. **Guides are data, not chrome.** Two sources (metrics from fontinfo, and
   user-authored), one type, each with `locked` / `snap` / `scope`.

## Running it

Needs Node 26 (see `.nvmrc`). Uses npm workspaces.

```sh
npm install
npm test          # unit tests, per package
npm run typecheck
npm run dev       # the playground
```

## Licensing

TBD, and it matters here: the two closest prior-art projects (Fontra and Glyphr
Studio 2) are GPL-3.0, so borrowing their code would force GPL. Every dependency
currently in the tree is MIT or permissive.
