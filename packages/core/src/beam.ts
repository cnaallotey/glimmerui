import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface BorderBeamOptions {
  /** Color at the head of the beam, as a hex value. */
  color?: string;
  /** Color the beam fades through behind its head, as a hex value. */
  tail?: string;
  /** Card fill color, as a hex value. */
  background?: string;
  /** Corner radius in CSS pixels. Match it with the element's own border-radius. */
  radius?: number;
  /** Border width in CSS pixels. */
  border?: number;
  /** Length of the beam as a share of the way around, from 0.05 to 1. */
  length?: number;
  /** How many beams share the border, from 1 to 4. */
  beams?: number;
  /** Laps take six seconds at 1, the default. Negative goes the other way. */
  speed?: number;
}

export type BorderBeamController = BackgroundController<BorderBeamOptions>;

// A beam of light that runs around a card's border, with a soft glow on the
// fill beside it. On the border, each pixel is given its distance along it,
// measured around the true rounded rectangle so the beam keeps its pace through
// the corners, and lit by how far behind a beam's head that is. The glow is a
// string of soft lights placed along each beam. Hovering speeds the beams up
// and lifts the fill near the pointer.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uTail;
uniform vec3 uBg;
uniform float uRadius;
uniform float uBorder;
uniform float uLength;
uniform float uBeams;
uniform float uFlip;
varying vec2 vUv;
${noiseChunk}
const float HALF_PI = 1.5707963;
// Distance along the border, clockwise from the left end of the top edge, as a
// share of the whole way around.
float along(vec2 p, vec2 b, float r) {
  float w = 2.0 * b.x;
  float h = 2.0 * b.y;
  float arc = HALF_PI * r;
  vec2 q = abs(p) - b;
  float s;
  if (q.x > 0.0 && q.y > 0.0) {
    vec2 c = q / max(length(q), 0.0001);
    // Angle from the vertical, 0 to a quarter turn.
    float a = atan(c.x, c.y);
    if (p.x > 0.0 && p.y > 0.0) s = w + a * r;
    else if (p.x > 0.0) s = w + arc + h + (HALF_PI - a) * r;
    else if (p.y < 0.0) s = 2.0 * w + 2.0 * arc + h + a * r;
    else s = 2.0 * w + 3.0 * arc + 2.0 * h + (HALF_PI - a) * r;
  } else if (q.y > q.x) {
    s = p.y > 0.0 ? p.x + b.x : w + 2.0 * arc + h + (b.x - p.x);
  } else {
    s = p.x > 0.0 ? w + arc + (b.y - p.y) : 2.0 * w + 3.0 * arc + h + (p.y + b.y);
  }
  return s / (2.0 * (w + h) + 4.0 * arc);
}
// The reverse: the point that far along the border, given in pixels.
vec2 pointAt(float s, vec2 b, float r) {
  float w = 2.0 * b.x;
  float h = 2.0 * b.y;
  float arc = HALF_PI * r;
  float k = max(r, 0.0001);
  if (s < w) return vec2(s - b.x, b.y + r);
  s -= w;
  if (s < arc) return vec2(b.x + r * sin(s / k), b.y + r * cos(s / k));
  s -= arc;
  if (s < h) return vec2(b.x + r, b.y - s);
  s -= h;
  if (s < arc) return vec2(b.x + r * cos(s / k), -b.y - r * sin(s / k));
  s -= arc;
  if (s < w) return vec2(b.x - s, -b.y - r);
  s -= w;
  if (s < arc) return vec2(-b.x - r * sin(s / k), -b.y - r * cos(s / k));
  s -= arc;
  if (s < h) return vec2(-b.x - r, s - b.y);
  s -= h;
  return vec2(-b.x - r * cos(s / k), b.y + r * sin(s / k));
}
const float LIGHTS = 12.0;
// Light on the fill from every beam.
vec3 glow(vec2 p, vec2 b, float r, float around) {
  float spacing = uLength * around / LIGHTS;
  // Wide enough that neighboring lights blend into one streak.
  float reach = max(20.0, spacing * 0.8);
  vec3 sum = vec3(0.0);
  for (float j = 0.0; j < 4.0; j++) {
    if (j >= uBeams) break;
    for (float i = 0.0; i < LIGHTS; i++) {
      float t = (i + 0.5) / LIGHTS;
      float share = fract(uTime / 6.0 + j / uBeams - t * uLength);
      if (uFlip > 0.5) share = 1.0 - share;
      vec2 d = (p - pointAt(share * around, b, r)) / reach;
      sum += mix(uColor, uTail, smoothstep(0.0, 0.75, t)) * pow(1.0 - t, 1.6) * exp(-0.5 * dot(d, d));
    }
  }
  return sum * spacing / (reach * 2.5);
}
void main() {
  vec2 px = vUv * uRes;
  vec2 halfSize = uRes * 0.5;
  float r = min(uRadius, min(halfSize.x, halfSize.y));
  vec2 p = px - halfSize;
  vec2 b = halfSize - r;
  vec2 q = abs(p) - b;
  float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float inside = 1.0 - smoothstep(-0.5, 0.5, sdf);
  float ring = 1.0 - smoothstep(0.0, 1.0, abs(sdf + uBorder * 0.5) - uBorder * 0.5);

  // How far behind the nearest head this point is, as a share of the gap between beams.
  float at = along(p, b, r);
  if (uFlip > 0.5) at = 1.0 - at;
  float behind = fract(uTime / 6.0 - at);
  behind = fract(behind * uBeams) / uBeams;
  float k = behind / uLength;
  float beam = k < 1.0 ? pow(1.0 - k, 1.6) : 0.0;
  // A short soft lead, so the head isn't cut off square.
  float ahead = (1.0 / uBeams - behind) * (2.0 * (uRes.x + uRes.y));
  beam = max(beam, exp(-ahead * 0.22));
  vec3 tint = mix(uColor, uTail, smoothstep(0.0, 0.75, k));
  // The lead belongs to the head, which would otherwise be a whole lap away.
  tint = mix(tint, uColor, exp(-ahead * 0.22));
  float around = 4.0 * (b.x + b.y) + 4.0 * HALF_PI * r;
  float dp = distance(px, uPointer * uRes) / (max(uRes.x, uRes.y) * 0.45);
  float lift = exp(-dp * dp) * uHover * 0.07;

  vec3 edge = mix(uBg, vec3(dot(uBg, vec3(0.333)) > 0.5 ? 0.0 : 1.0), 0.14);
  vec3 col = uBg + glow(p, b, r, around) * 0.34 + uColor * lift + (hash(px) - 0.5) * 0.012;
  col = mix(col, mix(edge, tint, beam), ring);
  gl_FragColor = vec4(col, max(inside, ring));
}
`;

export function createBorderBeam(
  container: HTMLElement,
  options: BorderBeamOptions = {}
): BorderBeamController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#f9b44c",
      tail: o.tail ?? "#e0457b",
      background: o.background ?? "#16151c",
      radius: Math.max(0, o.radius ?? 16),
      border: Math.max(0.5, o.border ?? 1.5),
      length: Math.min(1, Math.max(0.05, o.length ?? 0.3)),
      beams: Math.min(4, Math.max(1, Math.round(o.beams ?? 1))),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uTail: new Color(r.tail),
      uBg: new Color(r.background),
      uRadius: r.radius,
      uBorder: r.border,
      // Beams that share the border never run into each other.
      uLength: Math.min(r.length, 0.95 / r.beams),
      uBeams: r.beams,
      uFlip: r.speed < 0 ? 1 : 0,
    }),
    fallback: (r) => r.background,
    speed: (r, hover) => Math.abs(r.speed) * (1 + hover * 0.6),
    pointerSpring: { type: "spring", stiffness: 220, damping: 28 },
    hoverTransition: { duration: 0.35 },
  });
}
