import { Color } from "ogl";
import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk, noiseChunk } from "./shaders";

export interface RainImageOptions extends ImageEffectBaseOptions {
  /** How heavy the rain is, from 0 to 1. Defaults to 0.6. */
  amount?: number;
  /** How fast drops fall. 1 is the default; 0 holds them still. */
  speed?: number;
  /** How steamed up the glass is, from 0 to 1. Defaults to 0.7. */
  fog?: number;
  /** Color of the fog, as a hex value. */
  tint?: string;
  /** Radius of the dry, clear area around the pointer, in CSS pixels. Defaults to 130. */
  radius?: number;
}

export type RainImageController = ImageEffectController<RainImageOptions>;

// Rain on a window. Two kinds of drop, each a soft bump whose slope bends the
// view behind it like a small lens: beads, which swell and dry up in place, and
// runners, which slide down a column in fits and starts and wipe a clear trail
// in the fog. Sizes are in CSS pixels, so drops stay drop-sized at any element
// size.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uAmount;
uniform float uSpeed;
uniform float uFog;
uniform vec3 uTint;
uniform float uRadius;
varying vec2 vUv;
${noiseChunk}
${coverChunk}
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
// Adds a round drop of radius r, with d the vector from its center. xy collects
// the slope and z how much glass the drop covers.
void addDrop(vec2 d, float r, inout vec3 acc) {
  float k = length(d) / max(r, 0.001);
  if (k >= 1.0) return;
  float cover = 1.0 - smoothstep(0.8, 1.0, k);
  if (cover <= acc.z) return;
  acc = vec3(d / max(r, 0.001) * (0.35 + 0.65 * k * k), cover);
}
// Beads: one per cell, off the cell's center, each on its own cycle.
void beads(vec2 px, float cell, float share, float seed, float t, inout vec3 acc) {
  vec2 id = floor(px / cell);
  vec2 rnd = hash2(gridPoint(id) + seed);
  float roll = hash(gridPoint(id) + seed + 41.0);
  if (roll > share) return;
  float life = fract(t * (0.05 + 0.08 * rnd.x) + rnd.y);
  float swell = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.65, 1.0, life));
  float r = cell * (0.12 + 0.16 * rnd.y) * swell;
  vec2 c = (id + 0.3 + 0.4 * rnd) * cell;
  addDrop(px - c, r, acc);
}
// Runners: one per column. Returns how clear the glass is behind it.
float runners(vec2 px, float width, float share, float seed, float t, inout vec3 acc) {
  float col = floor(px.x / width);
  float rnd = hash(vec2(floor(col + 0.5), seed));
  float rnd2 = hash(vec2(floor(col + 0.5), seed + 7.0));
  if (rnd > share) return 0.0;
  // A lap takes the drop from above the glass to below it.
  float lap = uRes.y + 220.0;
  float pace = t * (0.07 + 0.09 * rnd2) + rnd2 * 13.0;
  // Fits and starts: the steps of a slow stair, smoothed.
  float run = pace + 0.055 * sin(pace * 19.0) + 0.02 * sin(pace * 43.0 + rnd * 6.0);
  float y = uRes.y + 110.0 - fract(run) * lap;
  float r = width * (0.13 + 0.07 * rnd2);
  // The path wanders, and the trail follows the same path.
  float wander = (noise(vec2(px.y * 0.012, col * 3.7 + seed)) - 0.5) * width * 0.5;
  float x = (col + 0.5) * width + wander;
  vec2 d = px - vec2(x, y);
  // Teardrop: narrower above.
  d.x *= 1.0 + max(d.y, 0.0) / r * 0.35;
  d.y *= d.y > 0.0 ? 0.72 : 1.0;
  addDrop(d, r, acc);
  // Beads left along the trail, smaller the older they are.
  float above = px.y - y;
  if (above <= 0.0 || above >= 200.0) return 0.0;
  float step_ = 15.0 + 8.0 * rnd;
  float by = floor(px.y / step_);
  float br = r * 0.42 * (1.0 - above / 200.0) * (0.5 + 0.5 * hash(vec2(by, col + seed)));
  float center = (by + 0.5) * step_;
  if (center > y + r * 1.5) addDrop(vec2(px.x - x, px.y - center), br, acc);
  float across = 1.0 - smoothstep(r * 0.55, r * 0.95, abs(px.x - x));
  return across * (1.0 - above / 200.0) * smoothstep(0.0, r, above);
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;
  float t = uTime * uSpeed;

  vec3 acc = vec3(0.0);
  beads(px, 17.0, 0.45 * uAmount, 3.0, t, acc);
  beads(px + 9.0, 33.0, 0.5 * uAmount, 11.0, t, acc);
  float trail = runners(px, 58.0, 0.75 * uAmount, 1.0, t, acc);
  trail = max(trail, runners(px + 23.0, 91.0, 0.8 * uAmount, 5.0, t * 1.15, acc));

  // The pointer wipes the glass dry.
  float d = distance(px, uPointer * uRes);
  float wiped = (1.0 - smoothstep(uRadius * 0.6, uRadius, d)) * uHover;
  float cover = acc.z * (1.0 - wiped);

  // Fogged glass: a soft blur with a wash of color.
  float fog = uFog * (1.0 - wiped) * (1.0 - 0.92 * trail);
  vec3 blur = vec3(0.0);
  // Each pixel turns the sample pattern a little, so it never shows as a shape.
  float turn = hash(px) * 6.28318;
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float r = sqrt((fi + 0.5) / 14.0) * 0.034 * fog;
    float a = fi * 2.39996 + turn;
    blur += image(vUv + vec2(cos(a), sin(a)) * r * vec2(1.0 / ca, 1.0), ca);
  }
  blur /= 14.0;
  vec3 col = mix(blur, uTint, 0.34 * fog);

  // A drop shows the view upside down and shrunk, with a dark rim and a glint.
  vec2 lens = vUv - acc.xy * vec2(1.0 / ca, 1.0) * 0.13;
  vec3 inside = image(clamp(lens, 0.0, 1.0), ca);
  float k = length(acc.xy);
  inside *= 1.0 - 0.38 * smoothstep(0.45, 1.0, k);
  vec2 hl = acc.xy - vec2(-0.22, 0.26);
  inside += 0.45 * exp(-dot(hl, hl) * 26.0);
  col = mix(col, inside, cover);

  gl_FragColor = vec4(mix(uTint * 0.4, col, uLoaded), 1.0);
}
`;

export function createRainImage(container: HTMLElement, options: RainImageOptions): RainImageController {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      amount: clamp01(o.amount ?? 0.6),
      speed: Math.max(0, o.speed ?? 1),
      fog: clamp01(o.fog ?? 0.7),
      tint: o.tint ?? "#aeb6c2",
      radius: o.radius ?? 130,
    }),
    uniforms: (r) => ({
      uAmount: r.amount,
      uSpeed: r.speed,
      uFog: r.fog,
      uTint: new Color(r.tint),
      uRadius: r.radius,
    }),
  });
}
