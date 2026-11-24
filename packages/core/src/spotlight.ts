import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface SpotlightCardOptions {
  /** Color of the border light and spotlight, as a hex value. */
  color?: string;
  /** Card fill color, as a hex value. */
  background?: string;
  /** Corner radius in CSS pixels. Match it with the element's own border-radius. */
  radius?: number;
  /** Border width in CSS pixels. */
  border?: number;
}

export type SpotlightCardController = BackgroundController<SpotlightCardOptions>;

// A card whose border lights up near the pointer, with a soft spotlight on the
// fill beneath it. The card is a rounded rectangle measured in pixels, so the
// border stays crisp at any size; outside it the canvas is transparent. A
// touch of grain keeps the spotlight from banding on dark fills.
const fragment = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uBg;
uniform float uRadius;
uniform float uBorder;
varying vec2 vUv;
${noiseChunk}
void main() {
  vec2 px = vUv * uRes;
  vec2 halfSize = uRes * 0.5;
  vec2 q = abs(px - halfSize) - halfSize + uRadius;
  float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float inside = 1.0 - smoothstep(-0.5, 0.5, sdf);

  float d = distance(px, uPointer * uRes);
  float reach = max(uRes.x, uRes.y) * 0.45;
  float near = exp(-(d * d) / (reach * reach));

  float ring = 1.0 - smoothstep(0.0, 1.0, abs(sdf + uBorder * 0.5) - uBorder * 0.5);
  float borderLight = ring * (0.12 + 0.88 * near * uHover);
  float spot = near * uHover * 0.16;

  vec3 col = uBg + uColor * spot + (hash(px) - 0.5) * 0.015;
  col = mix(col, uColor, borderLight);
  float alpha = max(inside, ring);
  gl_FragColor = vec4(col, alpha);
}
`;

export function createSpotlightCard(
  container: HTMLElement,
  options: SpotlightCardOptions = {}
): SpotlightCardController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#e0457b",
      background: o.background ?? "#16151c",
      radius: Math.max(0, o.radius ?? 16),
      border: Math.max(0.5, o.border ?? 1.5),
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uBg: new Color(r.background),
      uRadius: r.radius,
      uBorder: r.border,
    }),
    fallback: (r) => r.background,
    pointerSpring: { type: "spring", stiffness: 220, damping: 28 },
    hoverTransition: { duration: 0.35 },
  });
}
