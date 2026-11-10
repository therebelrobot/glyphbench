import { describe, expect, it } from "vitest";
import { contourBounds, contourToPathData } from "./geometry";
import type { Contour, Point } from "./types";

let seq = 0;

function point(x: number, y: number, type?: Point["type"]): Point {
  return { id: `p${++seq}`, x, y, type, smooth: false };
}

function contour(points: Point[], closed = true): Contour {
  return { id: `c${++seq}`, closed, points };
}

const square = () =>
  contour([
    point(0, 0, "line"),
    point(100, 0, "line"),
    point(100, 100, "line"),
    point(0, 100, "line"),
  ]);

describe("contourToPathData", () => {
  it("writes a closed square in font units when the flip is off", () => {
    expect(contourToPathData(square(), { yFlip: false })).toBe("M0,0L100,0L100,100L0,100Z");
  });

  it("flips Y into SVG space by default", () => {
    expect(contourToPathData(square())).toBe("M0,0L100,0L100,-100L0,-100Z");
  });

  it("writes a cubic from two off-curve points", () => {
    const curve = contour([point(0, 0, "line"), point(50, 0), point(100, 50), point(100, 100, "curve")]);
    expect(contourToPathData(curve, { yFlip: false })).toBe("M0,0C50,0,100,50,100,100Z");
  });

  it("wraps trailing controls around onto the start point", () => {
    const curve = contour([
      point(0, 0, "line"),
      point(100, 0, "line"),
      point(100, 100, "line"),
      point(50, 100),
      point(0, 50),
    ]);
    expect(contourToPathData(curve, { yFlip: false })).toBe("M0,0L100,0L100,100C50,100,0,50,0,0Z");
  });

  it("leaves an open contour open", () => {
    const line = contour([point(0, 0, "move"), point(100, 0, "line")], false);
    expect(contourToPathData(line, { yFlip: false })).toBe("M0,0L100,0");
  });

  it("rounds for output without touching the model", () => {
    const fractional = contour([point(0.5, 0.25, "line"), point(10.126, 3.004, "line")], false);
    expect(contourToPathData(fractional, { yFlip: false })).toBe("M0.5,0.25L10.13,3");
  });

  it("refuses quadratic contours", () => {
    const quad = contour([point(0, 0, "line"), point(50, 50), point(100, 0, "qcurve")]);
    expect(() => contourToPathData(quad)).toThrow(/quadratic/);
  });

  it("refuses a contour that starts off-curve", () => {
    const bad = contour([point(0, 0), point(100, 0, "line")]);
    expect(() => contourToPathData(bad)).toThrow(/on-curve/);
  });

  it("refuses a stray control point", () => {
    const bad = contour([point(0, 0, "line"), point(50, 50), point(100, 0, "line")]);
    expect(() => contourToPathData(bad)).toThrow(/off-curve/);
  });
});

describe("contourBounds", () => {
  it("returns null for an empty contour", () => {
    expect(contourBounds(contour([]))).toBeNull();
  });

  it("covers control points as well as on-curve ones", () => {
    const curve = contour([point(0, 0, "line"), point(-40, 200), point(140, 200), point(100, 0, "curve")]);
    expect(contourBounds(curve)).toEqual({ xMin: -40, yMin: 0, xMax: 140, yMax: 200 });
  });
});
