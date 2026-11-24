import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface SilkOptions {
  /** Fabric color, as a hex value. */
  color?: string;
  /** Color of the sheen along the folds, as a hex value. */
  sheen?: string;
  /** How many folds cross the surface. 1 is the default. */
  folds?: number;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type SilkController = BackgroundController<SilkOptions>;

// A height field of soft folds, lit from the upper left. The normal comes
// from finite differences, which gives the satin sheen along each crest.
// The pointer pinches the fabric up into a small peak.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uSheen;
uniform float uFolds;
varying vec2 vUv;
${noiseChunk}
float height(vec2 p, vec2 pp, float t) {
  // Only two low-frequency layers: fabric folds are smooth, and fine noise
  // turns into grain once the lighting differentiates it.
  float w = noise(p * 0.6 + vec2(0.0, t * 0.25)) + 0.5 * noise(p * 1.1 - vec2(t * 0.15, 0.0));
  float h = sin(p.x * 3.0 * uFolds + p.y * 1.2 + w * 2.6 + t);
  h += 0.5 * sin(p.x * 1.3 * uFolds - p.y * 2.1 + w * 1.6 - t * 0.7);
  vec2 d = p - pp;
  h += uHover * 1.4 * exp(-dot(d, d) * 7.0);
  return h;
}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * 0.35;
  vec2 p = vec2(vUv.x * ca, vUv.y) * 2.0;
  vec2 pp = vec2(uPointer.x * ca, uPointer.y) * 2.0;
  float e = 0.02;
  float h = height(p, pp, t);
  float hx = height(p + vec2(e, 0.0), pp, t);
  float hy = height(p + vec2(0.0, e), pp, t);
  vec3 n = normalize(vec3(-(hx - h) / e * 0.32, -(hy - h) / e * 0.32, 1.0));

  vec3 l = normalize(vec3(-0.4, 0.5, 0.75));
  float diff = max(dot(n, l), 0.0);
  float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
  float rim = pow(1.0 - n.z, 2.0);
  vec3 col = uColor * (0.08 + 1.05 * diff * diff) + uSheen * (spec * 0.7 + rim * 0.2);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createSilk(container: HTMLElement, options: SilkOptions = {}): SilkController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#3b1d8f",
      sheen: o.sheen ?? "#f4f4f6",
      folds: Math.max(0.1, o.folds ?? 1),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uSheen: new Color(r.sheen),
      uFolds: r.folds,
    }),
    fallback: (r) =>
      `linear-gradient(135deg, color-mix(in srgb, ${r.color} 60%, black), ${r.color} 45%, color-mix(in srgb, ${r.color} 70%, ${r.sheen}) 55%, ${r.color} 70%, color-mix(in srgb, ${r.color} 60%, black))`,
    speed: (r) => r.speed,
    pointerSpring: { type: "spring", stiffness: 80, damping: 16 },
  });
}
