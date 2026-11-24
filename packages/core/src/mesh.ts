import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface MeshGradientOptions {
  /** Four hex colors, each anchored to a slowly wandering point. */
  colors?: [string, string, string, string];
  /** Film grain strength, from 0 to 1. */
  grain?: number;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type MeshGradientController = BackgroundController<MeshGradientOptions>;

const DEFAULT_COLORS: [string, string, string, string] = ["#3b1d8f", "#e0457b", "#f9b44c", "#22d3ee"];

// Four colors blended by inverse distance to four drifting points, over a
// gently warped surface. The pointer drags the surface toward it.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;
uniform float uGrain;
varying vec2 vUv;
${noiseChunk}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * 0.12;
  vec2 uv = vUv;
  uv += 0.14 * vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 - t + 5.2)) - 0.07;

  vec2 toP = (uPointer - uv) * vec2(ca, 1.0);
  uv += (uPointer - uv) * 0.3 * uHover * exp(-dot(toP, toP) * 4.0);

  vec2 a = vec2(0.15 + 0.1 * sin(t * 1.3), 0.85 + 0.08 * cos(t * 1.1));
  vec2 b = vec2(0.85 + 0.08 * cos(t * 0.9), 0.8 + 0.1 * sin(t * 1.7));
  vec2 c = vec2(0.8 + 0.1 * sin(t * 1.5 + 2.0), 0.15 + 0.08 * cos(t * 1.2));
  vec2 d = vec2(0.2 + 0.08 * cos(t * 1.4 + 1.0), 0.2 + 0.1 * sin(t * 0.8));
  vec2 s = vec2(ca, 1.0);
  float wa = 1.0 / pow(length((uv - a) * s) + 0.05, 2.5);
  float wb = 1.0 / pow(length((uv - b) * s) + 0.05, 2.5);
  float wc = 1.0 / pow(length((uv - c) * s) + 0.05, 2.5);
  float wd = 1.0 / pow(length((uv - d) * s) + 0.05, 2.5);
  vec3 col = (uC1 * wa + uC2 * wb + uC3 * wc + uC4 * wd) / (wa + wb + wc + wd);

  col += (hash(vUv * uRes) - 0.5) * uGrain * 0.12;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createMeshGradient(
  container: HTMLElement,
  options: MeshGradientOptions = {}
): MeshGradientController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      colors: o.colors ?? DEFAULT_COLORS,
      grain: Math.min(1, Math.max(0, o.grain ?? 0.5)),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uC1: new Color(r.colors[0]),
      uC2: new Color(r.colors[1]),
      uC3: new Color(r.colors[2]),
      uC4: new Color(r.colors[3]),
      uGrain: r.grain,
    }),
    fallback: (r) =>
      [
        `radial-gradient(at 15% 15%, ${r.colors[0]}, transparent 60%)`,
        `radial-gradient(at 85% 20%, ${r.colors[1]}, transparent 60%)`,
        `radial-gradient(at 80% 85%, ${r.colors[2]}, transparent 60%)`,
        `radial-gradient(at 20% 80%, ${r.colors[3]}, transparent 60%)`,
        r.colors[0],
      ].join(", "),
    speed: (r) => r.speed,
  });
}
