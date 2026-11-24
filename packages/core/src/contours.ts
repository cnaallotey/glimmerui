import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface ContourLinesOptions {
  /** Line color, as a hex value. */
  color?: string;
  /** Color lines take on near the pointer, as a hex value. */
  accent?: string;
  /** Roughly how many lines cross the element from top to bottom. */
  density?: number;
  /** Line width, in CSS pixels. Every fifth line is drawn heavier. */
  width?: number;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type ContourLinesController = BackgroundController<ContourLinesOptions>;

// A topographic map of a slowly shifting noise terrain. Lines sit at even
// heights; their width is kept constant in pixels by dividing the distance to
// the nearest line by how fast the height changes per pixel. The pointer
// raises a hill, so lines ring around it. Draws on a transparent background.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uDensity;
uniform float uWidth;
varying vec2 vUv;
${noiseChunk}
// Gradient noise: a random direction at each grid point, blended with a
// quintic curve. Unlike value noise, it has no flat patches lined up with the
// grid, so contour lines drawn from it never show the grid.
vec2 gradientAt(vec2 i) {
  float a = hash(i) * 6.2831853;
  return vec2(cos(a), sin(a));
}
float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(gradientAt(i), f);
  float b = dot(gradientAt(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(gradientAt(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(gradientAt(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float terrain(vec2 p, vec2 pp, float t) {
  vec2 q = p * 1.4 + vec2(t, t * 0.4);
  float h = 0.6 * smoothNoise(q) + 0.28 * smoothNoise(q * 2.1 + 5.3) + 0.12 * smoothNoise(q * 4.3 + 1.7);
  vec2 d = p - pp;
  return h + uHover * 0.35 * exp(-dot(d, d) * 9.0);
}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * 0.04;
  vec2 p = vec2(vUv.x * ca, vUv.y);
  vec2 pp = vec2(uPointer.x * ca, uPointer.y);
  float e = 1.0 / uRes.y;
  float k = uDensity * 2.0;
  float v = terrain(p, pp, t) * k;
  float vx = terrain(p + vec2(e, 0.0), pp, t) * k;
  float vy = terrain(p + vec2(0.0, e), pp, t) * k;
  float perPixel = max(length(vec2(vx - v, vy - v)), 0.0001);

  float index = floor(v + 0.5);
  float major = step(abs(mod(index, 5.0)), 0.5);
  float w = uWidth * (1.0 + major * 0.8);
  float distPx = abs(fract(v + 0.5) - 0.5) / perPixel;
  float line = 1.0 - smoothstep(w * 0.5 - 0.5, w * 0.5 + 0.5, distPx);

  vec2 dp = (p - pp);
  float near = exp(-dot(dp, dp) * 12.0) * uHover;
  vec3 col = mix(uColor, uAccent, near);
  gl_FragColor = vec4(col, line * (0.55 + 0.45 * major));
}
`;

export function createContourLines(
  container: HTMLElement,
  options: ContourLinesOptions = {}
): ContourLinesController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#8b8a94",
      accent: o.accent ?? "#e0457b",
      density: Math.max(1, o.density ?? 12),
      width: Math.max(0.5, o.width ?? 1),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uAccent: new Color(r.accent),
      uDensity: r.density,
      uWidth: r.width,
    }),
    fallback: (r) =>
      `repeating-radial-gradient(circle at 35% 45%, transparent 0 ${Math.round(400 / r.density) - 1}px, ${r.color} ${Math.round(400 / r.density) - 1}px ${Math.round(400 / r.density)}px)`,
    speed: (r) => r.speed,
  });
}
