import { Color } from "ogl";
import { createImageEffect, type ImageEffectController } from "./imageEffect";
import { coverChunk } from "./shaders";

export interface DitherImageOptions {
  /** Image URL. Must be same origin or served with CORS headers. */
  src: string;
  /** Size of each dither dot, in CSS pixels. Defaults to 2. */
  pixel?: number;
  /** Dark color, as a hex value. */
  ink?: string;
  /** Light color, as a hex value. */
  paper?: string;
  /** Radius of the full-color area around the pointer, in CSS pixels. Defaults to 140. */
  radius?: number;
}

export type DitherImageController = ImageEffectController<DitherImageOptions>;

// One-bit ordered dithering, like an early Macintosh screen: every dot is
// either ink or paper, chosen by comparing the image's brightness there with
// an 8x8 Bayer threshold pattern. Around the pointer the full-color image
// shows through.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uPixel;
uniform float uRadius;
uniform vec3 uInk;
uniform vec3 uPaper;
varying vec2 vUv;
${coverChunk}
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
// Bayer thresholds built up from the 2x2 pattern: 0 to 1 over an 8x8 tile.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}
float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;
  vec2 cell = floor(px / uPixel);
  vec2 center = (cell + 0.5) * uPixel;
  vec3 src = image(center / uRes, ca);
  float lum = dot(src, vec3(0.299, 0.587, 0.114));
  vec3 dithered = lum > bayer8(cell) ? uPaper : uInk;

  float d = distance(px, uPointer * uRes);
  float reveal = (1.0 - smoothstep(uRadius * 0.55, uRadius, d)) * uHover;
  vec3 col = mix(dithered, image(vUv, ca), reveal);
  col = mix(uPaper, col, uLoaded);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createDitherImage(
  container: HTMLElement,
  options: DitherImageOptions
): DitherImageController {
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      pixel: Math.max(1, o.pixel ?? 2),
      ink: o.ink ?? "#0e0d12",
      paper: o.paper ?? "#fafafa",
      radius: o.radius ?? 140,
    }),
    uniforms: (r) => ({
      uPixel: r.pixel,
      uInk: new Color(r.ink),
      uPaper: new Color(r.paper),
      uRadius: r.radius,
    }),
  });
}
