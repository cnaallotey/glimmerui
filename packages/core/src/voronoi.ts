import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface VoronoiOptions {
  /** Three hex colors the cells are tinted from. */
  colors?: [string, string, string];
  /** Color of the lines between cells, as a hex value. */
  line?: string;
  /** Roughly how many cells fit across the element's height. */
  scale?: number;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type VoronoiController = BackgroundController<VoronoiOptions>;

// Stained glass: slowly drifting Voronoi cells, each tinted from the palette
// and shaded a little toward its center, separated by dark leading. Cells near
// the pointer light up, as if light were shining through behind it.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uLine;
uniform float uScale;
varying vec2 vUv;
${noiseChunk}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * 0.4;
  vec2 p = vec2(vUv.x * ca, vUv.y) * uScale;
  vec2 i = floor(p);
  vec2 f = fract(p);

  float d1 = 8.0;
  float d2 = 8.0;
  vec2 nearest = vec2(0.0);
  vec2 nearestPoint = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = 0.5 + 0.4 * sin(t + 6.2831 * hash2(gridPoint(i + g)));
      float d = length(g + o - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        nearest = gridPoint(i + g);
        nearestPoint = g + o;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }

  float pick = hash(nearest);
  vec3 glass = pick < 0.34 ? uC1 : (pick < 0.67 ? uC2 : uC3);
  glass *= 0.75 + 0.25 * hash(nearest + 7.0);
  // A little brighter toward each cell's center.
  glass *= 1.05 - 0.35 * length(nearestPoint - f);

  // Light behind the pointer brightens the cells around it.
  vec2 cellCenter = (i + nearestPoint) / uScale;
  vec2 toP = cellCenter - vec2(uPointer.x * ca, uPointer.y);
  glass *= 1.0 + 0.9 * uHover * exp(-dot(toP, toP) * 18.0);

  // Lead lines about 2.5 pixels wide, whatever the scale.
  float pxPerUnit = uRes.y / uScale;
  float edge = (d2 - d1) * 0.5 * pxPerUnit;
  float lead = 1.0 - smoothstep(1.0, 2.0, edge);
  gl_FragColor = vec4(mix(glass, uLine, lead), 1.0);
}
`;

export function createVoronoi(container: HTMLElement, options: VoronoiOptions = {}): VoronoiController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      colors: o.colors ?? (["#3b1d8f", "#e0457b", "#f9b44c"] as [string, string, string]),
      line: o.line ?? "#0e0d12",
      scale: Math.max(1, o.scale ?? 6),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uC1: new Color(r.colors[0]),
      uC2: new Color(r.colors[1]),
      uC3: new Color(r.colors[2]),
      uLine: new Color(r.line),
      uScale: r.scale,
    }),
    fallback: (r) =>
      `conic-gradient(from 30deg at 40% 55%, ${r.colors[0]}, ${r.colors[1]}, ${r.colors[2]}, ${r.colors[0]})`,
    speed: (r) => r.speed,
  });
}
