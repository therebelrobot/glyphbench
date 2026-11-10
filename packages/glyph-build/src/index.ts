/**
 * The compile step.
 *
 * Empty on purpose. The next thing built in this repo is the spike that decides
 * what goes here: a hand-written two-glyph UFO compiled to a TTF and a WOFF2
 * inside a Web Worker, via fontTools on Pyodide.
 *
 * The open questions that spike answers:
 *   - How long is the Pyodide cold start, and can it be hidden behind a warm worker?
 *   - Does the Pyodide build ship brotli, which `fontTools.ttLib.woff2` needs?
 *   - Is ufo2ft + fontmake a workable install inside Pyodide, or does the UFO
 *     have to be compiled a level lower?
 */

export const NOT_IMPLEMENTED = "glyph-build: the compile spike comes first, see PLAN.md";
