import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";

export interface GridFloorOptions {
  /** Grid line color, as a hex value. */
  color?: string;
  /** Glow along the horizon, as a hex value. */
  glow?: string;
  /** Sky and floor color, as a hex value. */
  background?: string;
  /** How fast the grid rolls toward you. 1 is the default speed. */
  speed?: number;
}

export type GridFloorController = BackgroundController<GridFloorOptions>;

// A glowing grid floor in perspective, rolling toward the viewer, fading into a
// horizon glow. Each screen row below the horizon maps to a distance; grid
// lines are drawn a constant width in pixels using how fast world position
// changes per pixel at that distance. The pointer presses a dip into the floor.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uGlow;
uniform vec3 uBg;
varying vec2 vUv;

float gridLine(float coord, float perPixel, float widthPx) {
  float d = abs(fract(coord + 0.5) - 0.5) / max(perPixel, 0.00001);
  return 1.0 - smoothstep(widthPx * 0.5 - 0.5, widthPx * 0.5 + 0.5, d);
}

void main() {
  float ca = uRes.x / uRes.y;
  float horizon = 0.46;
  vec2 uv = vUv;

  // Press a dip into the floor under the pointer.
  vec2 d = (uv - uPointer) * vec2(ca, 1.0);
  uv.y += uHover * 0.035 * exp(-dot(d, d) * 40.0) * step(uv.y, horizon);

  vec3 col = uBg;
  float below = horizon - uv.y;
  if (below > 0.0) {
    float z = 0.35 / below;
    float px = 1.0 / uRes.y;
    float zPerPixel = 0.35 / (below * below) * px;
    // Four grid squares per world unit.
    float density = 4.0;
    float wx = (uv.x - 0.5) * ca * z * 2.0 * density;
    float wz = (z + uTime * 0.6) * density;
    float xPerPixel = ca * z * 2.0 * density / uRes.x;
    float lines = max(gridLine(wx, xPerPixel, 1.6), gridLine(wz, zPerPixel * density, 1.6));
    float fog = exp(-z * 0.18);
    col = uBg + uColor * lines * fog * 1.15;
    col += uGlow * 0.25 * exp(-below * 18.0);
  } else {
    // Sky: a soft glow above the horizon fading upward.
    col += uGlow * 0.55 * exp(-(-below) * 9.0);
  }
  // The horizon itself.
  col += uGlow * 0.6 * exp(-abs(uv.y - horizon) * uRes.y * 0.25);
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}
`;

export function createGridFloor(container: HTMLElement, options: GridFloorOptions = {}): GridFloorController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#e0457b",
      glow: o.glow ?? "#f9b44c",
      background: o.background ?? "#0e0d12",
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uGlow: new Color(r.glow),
      uBg: new Color(r.background),
    }),
    fallback: (r) =>
      [
        `linear-gradient(to bottom, ${r.background} 30%, color-mix(in srgb, ${r.glow} 45%, ${r.background}) 46%, ${r.background} 47%)`,
        `repeating-linear-gradient(90deg, transparent 0 39px, color-mix(in srgb, ${r.color} 50%, transparent) 39px 40px)`,
      ].join(", "),
    speed: (r) => r.speed,
  });
}
