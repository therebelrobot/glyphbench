/**
 * The glyphbench document model.
 *
 * Conventions below are load-bearing:
 *
 * - Coordinates are in FONT UNITS, Y-UP. Anything that draws must flip.
 * - Winding is implied by point order, exactly as in UFO. It is not stored.
 * - Off-curve points carry no `type`. That is the UFO encoding, not an oversight.
 * - Everything here serialises to UFO3 / GLIF, which is the interchange format.
 */

/** UFO point types. `undefined` means "off-curve", i.e. a control point. */
export type OnCurveType = "move" | "line" | "curve" | "qcurve";

export interface LockSpec {
  locked: boolean;
  /** When true, descendants inherit this lock. */
  cascade: boolean;
}

/**
 * A constraint holds a point in place while it is being edited. Locking is the
 * degenerate case of this, which is why there is no separate lock mechanism.
 */
export type Constraint =
  | { kind: "on-guide"; guideId: string }
  | { kind: "hold-x"; x: number }
  | { kind: "hold-y"; y: number }
  | { kind: "smooth" }
  | { kind: "symmetry"; axisGuideId: string };

export interface Point {
  id: string;
  x: number;
  y: number;
  /** Omitted for off-curve (control) points. */
  type?: OnCurveType;
  /** Only meaningful on-curve: the two handles are collinear and equal length. */
  smooth: boolean;
  name?: string;
  lock?: LockSpec;
  constraints?: Constraint[];
}

export interface Contour {
  id: string;
  closed: boolean;
  points: Point[];
  lock?: LockSpec;
}

/** `[a, b, c, d, e, f]`, as in SVG and every other affine transform. */
export type Matrix = [number, number, number, number, number, number];

export interface Component {
  id: string;
  /** Name of the glyph being referenced. */
  base: string;
  transform: Matrix;
  lock?: LockSpec;
}

export interface Anchor {
  id: string;
  name: string;
  x: number;
  y: number;
}

export type GuideScope = "font" | "glyph";
export type GuideKind = "metric" | "user";

/**
 * A guideline. The first four fields are UFO's; `scope`, `kind`, `locked` and
 * `snap` are ours, and belong in the glyph/font `lib` on export.
 */
export interface Guideline {
  id: string;
  name?: string;
  /** Set for a vertical guide (UFO semantics). */
  x?: number;
  /** Set for a horizontal guide (UFO semantics). */
  y?: number;
  /** Set for an angled guide, degrees counter-clockwise. */
  angle?: number;
  color?: string;
  scope: GuideScope;
  kind: GuideKind;
  locked: boolean;
  snap: boolean;
  visible: boolean;
}

export interface Glyph {
  name: string;
  unicode?: number[];
  advance: { width: number };
  contours: Contour[];
  components: Component[];
  anchors: Anchor[];
  /** Glyph-scoped guidelines. Font-scoped ones live on the font. */
  guidelines: Guideline[];
  lock?: LockSpec;
  lib: Record<string, unknown>;
}

export interface FontInfo {
  familyName: string;
  styleName: string;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  xHeight: number;
  capHeight: number;
  italicAngle: number;
}

/** `kerning[first][second] = value`, in font units. */
export type Kerning = Record<string, Record<string, number>>;

export interface Font {
  info: FontInfo;
  glyphs: Record<string, Glyph>;
  /** Font-scoped guidelines, inherited by every glyph's canvas. */
  guidelines: Guideline[];
  kerning: Kerning;
  /** OpenType feature source (`.fea`). */
  features: string;
  lib: Record<string, unknown>;
}
