import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk, noiseChunk } from "./shaders";

export interface GlitchImageOptions extends ImageEffectBaseOptions {
  /** How hard the image glitches on hover, from 0 to 2. 1 is the default. */
  strength?: number;
}

export type GlitchImageController = ImageEffectController<GlitchImageOptions>;

// On hover, horizontal bands of the image jump sideways, the color channels
// split, and faint scanlines appear. The glitch re-rolls about twelve times a
// second and is strongest in the rows around the pointer.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uStrength;
varying vec2 vUv;
${noiseChunk}
${coverChunk}
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
void main() {
  float ca = uRes.x / uRes.y;
  float tick = floor(uTime * 12.0);
  float band = floor(vUv.y * 22.0 + hash(vec2(tick, 1.0)) * 6.0);
  float roll = hash(vec2(band, tick));
  float near = exp(-pow((vUv.y - uPointer.y) * 3.5, 2.0));
  float amount = uHover * uStrength * (0.25 + 0.75 * near);

  float jump = max(roll - 0.62, 0.0) * 0.5 * amount;
  jump *= hash(vec2(band, tick + 3.0)) < 0.5 ? -1.0 : 1.0;
  vec2 uv = vUv + vec2(jump, 0.0);
  vec2 split = vec2(0.012 * amount * (0.4 + roll), 0.0);

  vec3 col = vec3(
    image(uv + split, ca).r,
    image(uv, ca).g,
    image(uv - split, ca).b
  );
  float scan = step(0.5, fract(vUv.y * uRes.y * 0.5));
  col *= 1.0 - 0.18 * amount * scan;
  col = mix(vec3(0.04, 0.04, 0.06), col, uLoaded);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createGlitchImage(
  container: HTMLElement,
  options: GlitchImageOptions
): GlitchImageController {
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({ strength: Math.min(2, Math.max(0, o.strength ?? 1)) }),
    uniforms: (r) => ({ uStrength: r.strength }),
    hoverTransition: { duration: 0.2 },
  });
}
