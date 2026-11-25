import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface LightRaysOptions {
  /** Color of the light, as a hex value. */
  color?: string;
  /** Color behind it, as a hex value. */
  background?: string;
  /** Where the light comes from along the top edge, from 0 (left) to 1 (right). */
  origin?: number;
  /** How wide the rays fan out, from 0.2 to 2. 1 is the default. */
  spread?: number;
  /** Brightness. 1 is the default. */
  intensity?: number;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type LightRaysController = BackgroundController<LightRaysOptions>;

// Shafts of light falling from a point above the element. Their brightness is
// noise over the angle from that point, in two layers that drift past each
// other, so shafts widen, part and close up. Hovering leans the light toward
// the pointer. Fine grain hides banding in the long falloff.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uColor;
uniform vec3 uBg;
uniform float uOrigin;
uniform float uSpread;
uniform float uIntensity;
varying vec2 vUv;
${noiseChunk}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * ca, vUv.y);
  vec2 source = vec2(uOrigin * ca, 1.22);
  vec2 d = p - source;
  float dist = length(d);

  // Angle from straight down, then from the direction the light leans.
  float angle = atan(d.x, -d.y);
  vec2 toP = vec2(uPointer.x * ca, uPointer.y) - source;
  float lean = atan(toP.x, -toP.y) * 0.7 * uHover;
  float a = (angle - lean) / uSpread;

  float t = uTime * 0.16;
  float rays = noise(vec2(angle / uSpread * 7.0 + t, t * 0.6))
    * noise(vec2(angle / uSpread * 13.0 - t * 1.4, t * 0.5 + 7.0));
  rays = smoothstep(0.06, 0.55, rays);
  float fine = noise(vec2(angle / uSpread * 34.0 + t * 0.8, 3.0));
  rays *= 0.72 + 0.28 * fine;

  float cone = exp(-a * a * 2.6);
  float fall = exp(-max(dist - 0.2, 0.0) * 1.25);
  float light = cone * fall * (rays * 1.6 + 0.2);
  // The source itself, glowing just past the top edge.
  light += exp(-dist * dist * 9.0) * 0.9;

  vec3 lit = uBg + (1.0 - exp(-uColor * uColor * light * 2.1 * uIntensity)) * (1.0 - uBg);
  lit += (hash(gl_FragCoord.xy) - 0.5) * 0.018;
  gl_FragColor = vec4(lit, 1.0);
}
`;

export function createLightRays(
  container: HTMLElement,
  options: LightRaysOptions = {}
): LightRaysController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      color: o.color ?? "#ffbe78",
      background: o.background ?? "#0c0d14",
      origin: o.origin ?? 0.5,
      spread: Math.min(2, Math.max(0.2, o.spread ?? 1)),
      intensity: Math.max(0, o.intensity ?? 1),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uColor: new Color(r.color),
      uBg: new Color(r.background),
      uOrigin: r.origin,
      uSpread: r.spread,
      uIntensity: r.intensity,
    }),
    fallback: (r) =>
      `radial-gradient(90% 120% at ${r.origin * 100}% -10%, ${r.color}, ${r.background} 70%)`,
    speed: (r) => r.speed,
    pointerSpring: { type: "spring", stiffness: 50, damping: 16 },
    hoverTransition: { duration: 0.9, ease: "easeOut" },
  });
}
