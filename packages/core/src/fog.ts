import { Color } from "ogl";
import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk, noiseChunk } from "./shaders";

export interface FogImageOptions extends ImageEffectBaseOptions {
  /** How frosted the glass is, from 0 to 1. Defaults to 1. */
  frost?: number;
  /** Color of the fog, as a hex value. */
  tint?: string;
  /** Radius of the clear area around the pointer, in CSS pixels. Defaults to 120. */
  radius?: number;
}

export type FogImageController = ImageEffectController<FogImageOptions>;

// The image seen through frosted glass: blurred, slightly scattered by the
// glass's grain, and washed with fog. The pointer wipes a clear patch that
// follows it.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uFrost;
uniform vec3 uTint;
uniform float uRadius;
varying vec2 vUv;
${noiseChunk}
${coverChunk}
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;

  // Grain in the glass scatters each pixel a little.
  vec2 grain = (hash2(floor(px / 2.0)) - 0.5) * 0.01 * uFrost;
  vec2 base = vUv + grain;

  // Blur: 16 samples on a golden-angle spiral.
  vec3 blur = vec3(0.0);
  float radius = 0.025 * uFrost;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float r = sqrt((fi + 0.5) / 16.0) * radius;
    float a = fi * 2.39996;
    blur += image(base + vec2(cos(a), sin(a)) * r * vec2(1.0 / ca, 1.0), ca);
  }
  blur /= 16.0;
  vec3 frosted = mix(blur, uTint, 0.32 * uFrost);

  float d = distance(px, uPointer * uRes);
  float clear = (1.0 - smoothstep(uRadius * 0.55, uRadius, d)) * uHover;
  // A faint bright rim where the glass has just been wiped.
  float rim = smoothstep(uRadius * 0.55, uRadius * 0.8, d) * (1.0 - smoothstep(uRadius * 0.8, uRadius, d)) * uHover;
  vec3 col = mix(frosted, image(vUv, ca), clear) + rim * 0.06;
  gl_FragColor = vec4(mix(uTint, col, uLoaded), 1.0);
}
`;

export function createFogImage(container: HTMLElement, options: FogImageOptions): FogImageController {
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      frost: Math.min(1, Math.max(0, o.frost ?? 1)),
      tint: o.tint ?? "#f4f4f6",
      radius: o.radius ?? 120,
    }),
    uniforms: (r) => ({ uFrost: r.frost, uTint: new Color(r.tint), uRadius: r.radius }),
  });
}
