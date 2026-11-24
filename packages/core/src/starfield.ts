import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";

export interface StarfieldOptions {
  /** Star color, as a hex value. */
  color?: string;
  /** Sky color, as a hex value. */
  background?: string;
  /** How many stars, as a multiplier. 1 is the default. */
  density?: number;
  /** Flight speed. 1 is the default; hovering doubles it. */
  speed?: number;
}

export type StarfieldController = BackgroundController<StarfieldOptions>;

// Flying through stars. Each of six layers is a grid of cells with one star
// each, scaled from far to near over time and faded in and out at the ends.
// Stars are drawn as short streaks from where they were a moment ago to where
// they are now, so they stretch as they speed past. The vanishing point
// follows the pointer.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uBg;
uniform float uDensity;
varying vec2 vUv;

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
  return length(pa - ba * h);
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 center = mix(vec2(0.5), uPointer, 0.6 * uHover);
  vec2 p = (vUv - center) * vec2(ca, 1.0);
  float px = 1.0 / uRes.y;

  vec3 col = uBg;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float depth = fract(uTime * 0.08 + fi / 6.0);
    float scale = mix(14.0, 0.5, depth);
    // Streaks lengthen while hovering, as the flight speeds up.
    float prevScale = mix(14.0, 0.5, max(depth - 0.004 * (1.0 + 4.0 * uHover), 0.0));
    vec2 q = p * scale + fi * 17.3;
    vec2 cell = floor(q);
    vec2 jitter = vec2(hash1(cell + fi), hash1(cell + fi + 7.1)) * 0.8 + 0.1;
    vec2 star = (cell + jitter - fi * 17.3) / scale;
    vec2 prev = (cell + jitter - fi * 17.3) / prevScale;
    float d = segment(p, prev, star);
    // Most cells stay empty; density raises the share that hold a star.
    float present = step(hash1(cell * 1.7 + fi * 5.3), 0.22 * uDensity);
    float size = mix(0.35, 1.6, depth * depth) * px;
    float glow = 1.0 - smoothstep(size, size + px, d);
    float fade = smoothstep(0.0, 0.3, depth) * (1.0 - smoothstep(0.88, 1.0, depth));
    float twinkle = 0.55 + 0.45 * hash1(cell + fi * 3.0);
    // Distant stars are dimmer, so depth reads.
    col += uColor * glow * fade * twinkle * present * (0.25 + 0.75 * depth);
  }
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}
`;

export function createStarfield(
  container: HTMLElement,
  options: StarfieldOptions = {}
): StarfieldController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#ffffff",
      background: o.background ?? "#05040a",
      density: Math.max(0.1, o.density ?? 1),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uBg: new Color(r.background),
      uDensity: r.density,
    }),
    fallback: (r) =>
      [
        `radial-gradient(1px 1px at 20% 30%, ${r.color}, transparent)`,
        `radial-gradient(1px 1px at 70% 60%, ${r.color}, transparent)`,
        `radial-gradient(1.5px 1.5px at 40% 80%, ${r.color}, transparent)`,
        `radial-gradient(1px 1px at 85% 15%, ${r.color}, transparent)`,
        r.background,
      ].join(", "),
    // Hovering warps faster.
    speed: (r, hover) => r.speed * (1 + hover),
    hoverTransition: { duration: 0.8, ease: "easeInOut" },
  });
}
