import { GlyphCanvas } from "glyphbench-editor";
import type { Contour, Font, Guideline, Point } from "glyphbench-core";

const UPM = 1000;
let seq = 0;
const id = (prefix: string) => `${prefix}${++seq}`;

/** A point. Omit `type` for off-curve (control) points, as UFO does. */
function point(x: number, y: number, type?: Point["type"]): Point {
  return { id: id("p"), x, y, type, smooth: false };
}

function contour(points: Point[], closed = true): Contour {
  return { id: id("c"), closed, points };
}

/**
 * A demo glyph: two rectangles and a cubic bowl.
 *
 * The counter is wound in the *opposite* direction to the outer contour, which
 * is what makes it a counter under the nonzero fill rule. Direction is not a
 * stored field — it is the order of the points, exactly as in UFO.
 */
const demoGlyph = {
  name: "demo",
  advance: { width: 1000 },
  contours: [
    contour([point(100, 0, "line"), point(500, 0, "line"), point(500, 700, "line"), point(100, 700, "line")]),
    contour([point(200, 100, "line"), point(200, 600, "line"), point(400, 600, "line"), point(400, 100, "line")]),
    contour([point(600, 0, "line"), point(900, 200), point(900, 500), point(600, 700, "curve")]),
  ],
  components: [],
  anchors: [],
  guidelines: [],
  lib: {},
};

const font: Font = {
  info: {
    familyName: "Glyphbench Demo",
    styleName: "Regular",
    unitsPerEm: UPM,
    ascender: 750,
    descender: -250,
    xHeight: 500,
    capHeight: 700,
    italicAngle: 0,
  },
  glyphs: { demo: demoGlyph },
  guidelines: [],
  kerning: {},
  features: "",
  lib: {},
};

const glyphGuides: Guideline[] = [
  {
    id: "g-user",
    name: "notes",
    y: 350,
    scope: "glyph",
    kind: "user",
    locked: false,
    snap: true,
    visible: true,
    color: "#b48ead",
  },
];

/** Metric guides are derived from fontinfo — here, by hand, until step 6 exists. */
const metricGuides: Guideline[] = [
  ["cap height", font.info.capHeight],
  ["x-height", font.info.xHeight],
  ["ascender", font.info.ascender],
  ["descender", font.info.descender],
].map(([name, y]) => ({
  id: `g-${name}`,
  name: String(name),
  y: Number(y),
  scope: "font",
  kind: "metric",
  locked: true,
  snap: true,
  visible: true,
  color: "#7aa2f7",
}));

export default function App() {
  return (
    <main
      style={{
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#2e3440",
        padding: "2rem",
        maxWidth: "56rem",
      }}
    >
      <h1 style={{ fontSize: "1.1rem", margin: "0 0 0.25rem" }}>glyphbench</h1>
      <p style={{ color: "#4c566a", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
        Step 1 of 12: the core model, the editor component and this harness are wired
        together. Nothing here is editable yet — that is step 4 onwards.
      </p>

      <GlyphCanvas
        glyph={demoGlyph}
        upm={font.info.unitsPerEm}
        guidelines={[...metricGuides, ...glyphGuides, ...font.guidelines, ...demoGlyph.guidelines]}
        size={520}
      />

      <p style={{ color: "#4c566a", fontSize: "0.85rem", marginTop: "1rem", maxWidth: "34rem" }}>
        Three contours: a rectangle, a counter wound the opposite way, and a cubic bowl.
        Solid blue lines are metric guides, dashed purple is a user guide, red is the
        advance width.
      </p>
    </main>
  );
}
