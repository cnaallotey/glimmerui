import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk } from "./shaders";

export interface KaleidoscopeImageOptions extends ImageEffectBaseOptions {
  /** Number of mirrored segments around the center. Defaults to 8. */
  segments?: number;
  /** How fast the pattern turns on its own. 1 is the default; 0 holds it still. */
  speed?: number;
}

export type KaleidoscopeImageController = ImageEffectController<KaleidoscopeImageOptions>;

// A kaleidoscope: the image folded into mirrored wedges around the center. It
// turns slowly on its own. On hover, the pointer's left-right position turns
// it further and its height zooms in or out.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uSegments;
uniform float uSpeed;
varying vec2 vUv;
${coverChunk}
void main() {
  float ca = uRes.x / uRes.y;
  float t = uTime * uSpeed;
  vec2 p = (vUv - 0.5) * vec2(ca, 1.0);
  float r = length(p);
  float a = atan(p.y, p.x);

  float turn = t * 0.08 + uHover * (uPointer.x - 0.5) * 3.14159;
  float wedge = 6.2831853 / uSegments;
  a = mod(a + turn, wedge);
  a = abs(a - wedge * 0.5);

  float zoom = 0.9 + uHover * (uPointer.y - 0.5) * 0.8;
  vec2 drift = vec2(sin(t * 0.21), cos(t * 0.17)) * 0.08;
  vec2 q = vec2(cos(a), sin(a)) * r * zoom + 0.5 + drift;
  vec3 col = texture2D(uTex, coverUv(q, 1.0, uImgAspect)).rgb;
  gl_FragColor = vec4(mix(vec3(0.04, 0.04, 0.06), col, uLoaded), 1.0);
}
`;

export function createKaleidoscopeImage(
  container: HTMLElement,
  options: KaleidoscopeImageOptions
): KaleidoscopeImageController {
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      segments: Math.max(2, Math.round(o.segments ?? 8)),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({ uSegments: r.segments, uSpeed: r.speed }),
    pointerSpring: { type: "spring", stiffness: 90, damping: 20 },
  });
}
