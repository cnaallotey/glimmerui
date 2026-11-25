import { Color } from "ogl";
import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk } from "./shaders";

export interface DuotoneImageOptions extends ImageEffectBaseOptions {
  /** Color for the image's shadows, as a hex value. */
  dark?: string;
  /** Color for the image's highlights, as a hex value. */
  light?: string;
}

export type DuotoneImageController = ImageEffectController<DuotoneImageOptions>;

// A two-color print of the image: shadows in one color, highlights in the
// other. On hover the original colors spread out from the pointer until they
// fill the image; leaving draws the duotone back in.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uDark;
uniform vec3 uLight;
varying vec2 vUv;
${coverChunk}
void main() {
  float ca = uRes.x / uRes.y;
  vec3 src = texture2D(uTex, coverUv(vUv, ca, uImgAspect)).rgb;
  float lum = dot(src, vec3(0.299, 0.587, 0.114));
  vec3 duo = mix(uDark, uLight, smoothstep(0.05, 0.95, lum));

  vec2 d = (vUv - uPointer) * vec2(ca, 1.0);
  float reach = uHover * (length(vec2(ca, 1.0)) + 0.3);
  float color = 1.0 - smoothstep(reach - 0.3, reach, length(d));
  vec3 col = mix(duo, src, color);
  gl_FragColor = vec4(mix(uDark, col, uLoaded), 1.0);
}
`;

export function createDuotoneImage(
  container: HTMLElement,
  options: DuotoneImageOptions
): DuotoneImageController {
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({ dark: o.dark ?? "#3b1d8f", light: o.light ?? "#f9b44c" }),
    uniforms: (r) => ({ uDark: new Color(r.dark), uLight: new Color(r.light) }),
    hoverTransition: { duration: 0.9, ease: "easeInOut" },
  });
}
