import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk } from "./shaders";
import { prefersReducedMotion } from "./stage";

export interface RippleImageOptions extends ImageEffectBaseOptions {
  /** Height of the ripples, from 0 to 2. 1 is the default. */
  strength?: number;
  /** How fast rings spread. 1 is the default. */
  speed?: number;
}

export interface RippleImageController extends ImageEffectController<RippleImageOptions> {
  /** Drop a stone at a point in 0 to 1 space, origin at the bottom left. */
  drop(x: number, y: number): void;
}

/** Rings that can spread at once. A new one replaces the oldest. */
const MAX_DROPS = 14;
/** The pointer leaves a ring every so many CSS pixels. */
const SPACING = 34;

// Still water over the image. Each drop is a point, the time it fell and its
// size; its ring of small waves spreads out and dies away. The waves' slope
// refracts the image and catches a little light.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform float uTime;
uniform vec2 uRes;
uniform vec4 uDrops[${MAX_DROPS}];
uniform float uStrength;
uniform float uSpeed;
varying vec2 vUv;
${coverChunk}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;
  vec2 slope = vec2(0.0);
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    vec4 drop = uDrops[i];
    float age = uTime - drop.z;
    if (drop.w <= 0.0 || age < 0.0 || age > 3.0) continue;
    vec2 d = px - drop.xy * uRes;
    float dist = length(d);
    float front = age * 190.0 * uSpeed;
    // Three or so waves trail the front, fading with age and distance.
    float behind = (dist - front) / 34.0;
    float envelope = exp(-behind * behind * 0.5) * exp(-age * 1.9) * smoothstep(0.0, 0.12, age);
    slope += d / max(dist, 1.0) * sin(behind * 3.4) * envelope * drop.w;
  }
  vec2 off = slope * uStrength * 15.0 / uRes;
  vec3 col = texture2D(uTex, coverUv(vUv + off, ca, uImgAspect)).rgb;
  // Light from the upper left.
  float light = dot(slope, normalize(vec2(1.0, -1.0))) * uStrength;
  col += max(-light, 0.0) * 0.22 - max(light, 0.0) * 0.12;
  gl_FragColor = vec4(mix(vec3(0.04, 0.04, 0.06), col, uLoaded), 1.0);
}
`;

export function createRippleImage(
  container: HTMLElement,
  options: RippleImageOptions
): RippleImageController {
  const drops = Array.from({ length: MAX_DROPS }, () => [0, 0, 0, 0]);
  let now = 0;
  let next = 0;
  let lastX = -1e6;
  let lastY = -1e6;

  const effect = createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      strength: Math.min(2, Math.max(0, o.strength ?? 1)),
      speed: Math.max(0.1, o.speed ?? 1),
    }),
    uniforms: (r) => ({ uDrops: drops, uStrength: r.strength, uSpeed: r.speed }),
    frame(seconds) {
      now = seconds;
    },
  });

  const add = (x: number, y: number, size: number) => {
    // A ring that can't spread would just sit there.
    if (prefersReducedMotion()) return;
    drops[next] = [x, y, now, size];
    next = (next + 1) % MAX_DROPS;
  };

  return {
    ...effect,
    setPointer(x, y) {
      effect.setPointer(x, y);
      const px = x * container.clientWidth;
      const py = y * container.clientHeight;
      if (Math.hypot(px - lastX, py - lastY) < SPACING) return;
      lastX = px;
      lastY = py;
      add(x, y, 0.45);
    },
    drop(x, y) {
      add(x, y, 1.3);
    },
  };
}
