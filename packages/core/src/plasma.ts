import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface PlasmaOptions {
  /** Three hex colors: the outer glow, the strands, and their hot core. */
  colors?: [string, string, string];
  /** Color behind it, as a hex value. */
  background?: string;
  /** How fine the strands are. 1 is the default; higher is busier. */
  scale?: number;
  /** Brightness. 1 is the default. */
  intensity?: number;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type PlasmaController = BackgroundController<PlasmaOptions>;

// Glowing strands of energy: the lines where a field of warped gradient noise
// crosses zero, drawn as a thin hot core inside a wide glow. Gradient noise,
// because the lines of value noise show creases. Strands bend toward the
// pointer and burn brighter there.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uBg;
uniform float uScale;
uniform float uIntensity;
varying vec2 vUv;
${noiseChunk}
// A gradient that turns slowly, so the field churns in place.
vec2 gradient(vec2 i, float t) {
  float a = hash(gridPoint(i)) * 6.28318 + t;
  return vec2(cos(a), sin(a));
}
float gnoise(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(gradient(i, t), f);
  float b = dot(gradient(i + vec2(1.0, 0.0), t), f - vec2(1.0, 0.0));
  float c = dot(gradient(i + vec2(0.0, 1.0), t), f - vec2(0.0, 1.0));
  float d = dot(gradient(i + vec2(1.0, 1.0), t), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// x: the hot core. y: the glow around it.
vec2 strands(vec2 p, float t) {
  vec2 warp = vec2(gnoise(p * 0.8 + 3.1, t), gnoise(p * 0.8 - 5.2, t * 1.1));
  float v = abs(gnoise(p + warp * 1.1, t * 0.8) + 0.35 * gnoise(p * 2.3 + warp, -t));
  // Charge comes and goes along each strand, so they read as arcs, not outlines.
  float charge = smoothstep(-0.12, 0.42, gnoise(p * 0.9 + warp * 0.6 + 17.0, t * 1.3));
  return vec2(exp(-v * 62.0) * charge, charge * 0.03 / (v + 0.05));
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(ca, 1.0);
  vec2 toP = (uPointer - 0.5) * vec2(ca, 1.0) - p;
  float near = exp(-dot(toP, toP) * 9.0) * uHover;
  p += toP * near * 0.45;

  float t = uTime * 0.45;
  vec2 a = strands(p * 2.6 * uScale + vec2(t * 0.12, 0.0), t);
  vec2 b = strands(p * 1.7 * uScale + vec2(8.0, -t * 0.1), t * 0.8 + 4.0);
  float core = a.x + b.x * 0.7;
  float glow = a.y + b.y * 0.8;
  float boost = (1.0 + near * 1.1) * uIntensity;

  // The glow runs from the outer color, far from a strand, to the inner, beside it.
  vec3 haze = uC1 * uC1 * (0.35 + glow * 1.5);
  vec3 light = haze + uC2 * uC2 * glow * glow * 3.2 + uC3 * core * 0.8;
  vec3 col = uBg + (1.0 - exp(-light * boost)) * (1.0 - uBg);
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`;

const DEFAULT_COLORS: [string, string, string] = ["#3b1d8f", "#e0457b", "#ffe9c9"];

export function createPlasma(container: HTMLElement, options: PlasmaOptions = {}): PlasmaController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      colors: o.colors ?? DEFAULT_COLORS,
      background: o.background ?? "#0a0812",
      scale: Math.max(0.2, o.scale ?? 1),
      intensity: Math.max(0, o.intensity ?? 1),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uC1: new Color(r.colors[0]),
      uC2: new Color(r.colors[1]),
      uC3: new Color(r.colors[2]),
      uBg: new Color(r.background),
      uScale: r.scale,
      uIntensity: r.intensity,
    }),
    fallback: (r) =>
      `radial-gradient(60% 80% at 30% 40%, ${r.colors[0]}, transparent), radial-gradient(50% 70% at 75% 65%, ${r.colors[1]}, transparent), ${r.background}`,
    speed: (r) => r.speed,
  });
}
