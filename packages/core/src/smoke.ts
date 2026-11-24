import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface InkSmokeOptions {
  /** Smoke color, as a hex value. */
  color?: string;
  /** Color behind the smoke, as a hex value. */
  background?: string;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type InkSmokeController = BackgroundController<InkSmokeOptions>;

// A plume of smoke rising and curling. Noise sampled in a frame that moves
// downward over time makes the detail drift upward; a second noise field bends
// the plume sideways more the higher it rises. At rest the plume rises from
// the bottom center; on hover its source follows the pointer.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uBg;
varying vec2 vUv;
${noiseChunk}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * 0.35;
  vec2 p = vec2(vUv.x * ca, vUv.y);
  vec2 rest = vec2(0.5 * ca, 0.02);
  vec2 source = mix(rest, vec2(uPointer.x * ca, uPointer.y), uHover);
  vec2 q = p - source;
  float rise = max(q.y, 0.0);

  vec2 bend = vec2(fbm(p * 1.6 + vec2(0.0, -t)), fbm(p * 1.6 + vec2(5.2, -t * 1.1))) - 0.5;
  vec2 r = q + bend * (0.15 + rise * 0.9);
  float width = 0.05 + 0.3 * rise;
  float plume = exp(-(r.x * r.x) / (width * width));
  plume *= smoothstep(-0.04, 0.04, q.y) * exp(-rise * 1.1);

  float detail = fbm(r * 3.5 + vec2(0.0, -t * 1.6));
  float density = clamp(plume * (0.35 + 1.1 * detail), 0.0, 1.0);
  gl_FragColor = vec4(mix(uBg, uColor, density), 1.0);
}
`;

export function createInkSmoke(container: HTMLElement, options: InkSmokeOptions = {}): InkSmokeController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#e9e8ee",
      background: o.background ?? "#0e0d12",
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uBg: new Color(r.background),
    }),
    fallback: (r) =>
      `radial-gradient(ellipse 30% 60% at 50% 100%, color-mix(in srgb, ${r.color} 35%, transparent), transparent), ${r.background}`,
    speed: (r) => r.speed,
    // Loose, so the plume's source drifts after the pointer like real smoke.
    pointerSpring: { type: "spring", stiffness: 40, damping: 14 },
    hoverTransition: { duration: 1, ease: "easeInOut" },
  });
}
