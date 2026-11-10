import type { Contour, Point } from "./types";

export interface PathOptions {
  /**
   * Emit SVG-space coordinates (Y down) instead of font units (Y up). On by
   * default: this string is for drawing, and drawing is Y-down.
   */
  yFlip?: boolean;
}

/**
 * Path data is cosmetic. The model keeps full precision, and the compiler reads
 * the model rather than this string, so rounding here is safe.
 */
function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(+n.toFixed(2));
}

/**
 * Serialise a contour to SVG path data.
 *
 * Linear and cubic segments only. TrueType quadratic contours must be normalised
 * to cubic on import, so a `qcurve` point reaching here is a bug, not a case.
 */
export function contourToPathData(contour: Contour, options: PathOptions = {}): string {
  const { yFlip = true } = options;
  const points = contour.points;
  const start = points[0];
  if (!start) return "";
  if (!start.type) throw new Error("contour must begin with an on-curve point");

  const xy = (p: Point) => `${num(p.x)},${num(yFlip ? -p.y : p.y)}`;
  const d: string[] = [`M${xy(start)}`];
  const controls: Point[] = [];

  for (const point of points.slice(1)) {
    if (!point.type) {
      controls.push(point);
      continue;
    }
    if (point.type === "qcurve") {
      throw new Error("quadratic contours are not supported; normalise to cubic on import");
    }
    if (controls.length === 2) {
      const [first, second] = controls as [Point, Point];
      d.push(`C${xy(first)},${xy(second)},${xy(point)}`);
    } else if (controls.length === 0) {
      d.push(`L${xy(point)}`);
    } else {
      throw new Error(
        `expected 0 or 2 off-curve points before an on-curve point, found ${controls.length}`,
      );
    }
    controls.length = 0;
  }

  if (contour.closed) {
    // Trailing controls wrap around and close back onto the start point.
    if (controls.length === 2) {
      const [first, second] = controls as [Point, Point];
      d.push(`C${xy(first)},${xy(second)},${xy(start)}`);
    } else if (controls.length !== 0) {
      throw new Error(`expected 0 or 2 off-curve points at the close, found ${controls.length}`);
    }
    d.push("Z");
  } else if (controls.length !== 0) {
    throw new Error(`open contour ends in ${controls.length} dangling off-curve point(s)`);
  }

  return d.join("");
}

export interface Bounds {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

/**
 * Bounding box over on-curve *and* off-curve points, in font units. This is the
 * control bounds, not the tight curve bounds — close enough for framing a
 * viewport, which is all it is for.
 */
export function contourBounds(contour: Contour): Bounds | null {
  const first = contour.points[0];
  if (!first) return null;

  const bounds: Bounds = { xMin: first.x, yMin: first.y, xMax: first.x, yMax: first.y };
  for (const point of contour.points) {
    bounds.xMin = Math.min(bounds.xMin, point.x);
    bounds.yMin = Math.min(bounds.yMin, point.y);
    bounds.xMax = Math.max(bounds.xMax, point.x);
    bounds.yMax = Math.max(bounds.yMax, point.y);
  }
  return bounds;
}
