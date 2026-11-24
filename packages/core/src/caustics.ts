import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface CausticsOptions {
  /** Water color at the bottom of the element, as a hex value. */
  deep?: string;
  /** Water color at the top of the element, as a hex value. */
  shallow?: string;
  /** Color of the light lines, as a hex value. */
  light?: string;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type CausticsController = BackgroundController<CausticsOptions>;

// Caustics: bright lines where light focuses through a moving water surface.
// The lines are the borders between animated Voronoi cells (where the nearest
// and second-nearest cell points are equally far), bent by slow noise so they
// curve like the real thing. Two layers at different scales cross into a web.
// The pointer sends rings out through the pattern.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uLight;
varying vec2 vUv;
${noiseChunk}
vec2 cellPoint(vec2 cell, float t) {
  return 0.5 + 0.42 * sin(t + 6.2831 * hash2(gridPoint(cell)));
}
// Distance to the nearest border between cells: 0 on a border.
float border(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      float d = length(g + cellPoint(i + g, t) - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return d2 - d1;
}
float caustic(vec2 p, float t) {
  vec2 q = p + 0.35 * vec2(noise(p * 0.6 + t * 0.2), noise(p * 0.6 - t * 0.2 + 4.0));
  float b = border(q, t);
  return pow(1.0 - smoothstep(0.0, 0.22, b), 3.0);
}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * 0.7;
  vec2 p = vec2(vUv.x * ca, vUv.y) * 4.0;
  vec2 pp = vec2(uPointer.x * ca, uPointer.y) * 4.0;
  vec2 d = p - pp;
  float dist = length(d);
  p += d / max(dist, 0.001) * sin(dist * 6.0 - t * 5.0) * 0.08 * uHover * exp(-dist * 0.8);

  float light = caustic(p, t) * 0.8 + caustic(p * 1.6 + 3.7, t * 1.3) * 0.45;
  vec3 water = mix(uDeep, uShallow, smoothstep(0.0, 1.0, vUv.y));
  vec3 col = water + uLight * light * (0.35 + 0.45 * vUv.y);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createCaustics(
  container: HTMLElement,
  options: CausticsOptions = {}
): CausticsController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      deep: o.deep ?? "#06283d",
      shallow: o.shallow ?? "#1b8fa6",
      light: o.light ?? "#e6fbff",
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uDeep: new Color(r.deep),
      uShallow: new Color(r.shallow),
      uLight: new Color(r.light),
    }),
    fallback: (r) => `linear-gradient(to top, ${r.deep}, ${r.shallow})`,
    speed: (r) => r.speed,
  });
}
