import { contourToPathData } from "glyphbench-core";
import type { Guideline, Glyph } from "glyphbench-core";

export interface GlyphCanvasProps {
  glyph: Glyph;
  /** Units per em. The drawing window is derived from it. */
  upm?: number;
  /**
   * Guidelines to draw. Merging font-scoped and glyph-scoped guides is the
   * caller's job; this component takes one flat list.
   */
  guidelines?: readonly Guideline[];
  /** Rendered width in CSS pixels. The window is square, so the height matches. */
  size?: number;
}

const METRIC_GUIDE = "#7aa2f7";
const USER_GUIDE = "#b48ead";
const BASELINE = "#4c566a";
const ADVANCE = "#bf616a";

/**
 * One glyph, rendered as real SVG in SVG's own coordinate space (Y down).
 *
 * Read-only for now. Everything the editor will eventually do — hit-testing,
 * selection, dragging handles — happens on top of this seam, which is why the
 * elements are the real thing and not a picture of the real thing.
 */
export function GlyphCanvas({ glyph, upm = 1000, guidelines = [], size = 520 }: GlyphCanvasProps) {
  // A window, not a clip: a quarter em of margin either side, 1.25em above the
  // baseline and 0.25em below. Glyphs are allowed to overflow the em box.
  const view = {
    x: -0.25 * upm,
    y: -1.25 * upm,
    width: 1.5 * upm,
    height: 1.5 * upm,
  };
  const hairline = upm / 500;

  const outline = glyph.contours.map((contour) => contourToPathData(contour)).join(" ");
  const horizontals = guidelines.filter(
    (guide): guide is Guideline & { y: number } =>
      guide.visible && typeof guide.y === "number",
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      role="img"
      aria-label={`Glyph ${glyph.name}`}
      style={{ display: "block", background: "#fdfdfd", color: "#2e3440" }}
    >
      {horizontals.map((guide) => (
        <line
          key={guide.id}
          x1={view.x}
          x2={view.x + view.width}
          y1={-guide.y}
          y2={-guide.y}
          stroke={guide.kind === "metric" ? METRIC_GUIDE : USER_GUIDE}
          strokeWidth={hairline}
          strokeDasharray={guide.kind === "metric" ? undefined : `${upm / 50} ${upm / 100}`}
        />
      ))}

      <line
        x1={view.x}
        x2={view.x + view.width}
        y1={0}
        y2={0}
        stroke={BASELINE}
        strokeWidth={hairline}
      />
      <line
        x1={glyph.advance.width}
        x2={glyph.advance.width}
        y1={view.y}
        y2={view.y + view.height}
        stroke={ADVANCE}
        strokeWidth={hairline}
        strokeDasharray={`${upm / 40} ${upm / 80}`}
      />

      <path d={outline} fill="currentColor" fillRule="nonzero" />
    </svg>
  );
}
