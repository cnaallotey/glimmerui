import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk } from "./shaders";

export interface ScrollImageOptions extends ImageEffectBaseOptions {
  /** How far scrolling bends the image, from 0 to 2. 1 is the default. */
  strength?: number;
  /** How far scrolling splits the color channels, from 0 to 2. 1 is the default. */
  split?: number;
}

export type ScrollImageController = ImageEffectController<ScrollImageOptions>;

// The image sags like a hanging sheet while the page scrolls, more the faster
// it goes, and springs back when it stops. uVelocity is signed: positive while
// the image moves up the screen. A little headroom around the image keeps the
// bend from reaching past its edges.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform float uVelocity;
uniform float uStrength;
uniform float uSplit;
varying vec2 vUv;
${coverChunk}
const float ZOOM = 0.86;
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv((uv - 0.5) * ZOOM + 0.5, ca, uImgAspect)).rgb;
}
void main() {
  float ca = uRes.x / uRes.y;
  float v = uVelocity;
  // The middle lags behind the sides.
  float sag = cos((vUv.x - 0.5) * 3.14159);
  vec2 uv = vUv;
  uv.y += v * uStrength * 0.075 * (sag - 0.35);
  uv.x += (vUv.x - 0.5) * abs(v) * uStrength * 0.06 * sin(vUv.y * 3.14159);
  vec2 split = vec2(0.0, v * uSplit * 0.014 * (0.4 + sag));
  vec3 col = vec3(image(uv + split, ca).r, image(uv, ca).g, image(uv - split, ca).b);
  gl_FragColor = vec4(mix(vec3(0.04, 0.04, 0.06), col, uLoaded), 1.0);
}
`;

/** Scroll speed, in CSS pixels a second, that bends the image about three quarters of the way. */
const FAST = 2200;
/** Spring that the bend follows: a little bouncy, so it settles with one small swing. */
const STIFFNESS = 130;
const DAMPING = 15;

export function createScrollImage(
  container: HTMLElement,
  options: ScrollImageOptions
): ScrollImageController {
  let lastTop = 0;
  let lastTime: number | undefined;
  let bend = 0;
  let rate = 0;

  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      strength: Math.min(2, Math.max(0, o.strength ?? 1)),
      split: Math.min(2, Math.max(0, o.split ?? 1)),
    }),
    uniforms: (r) => ({ uVelocity: 0, uStrength: r.strength, uSplit: r.split }),
    // Measuring the element, rather than listening for scroll events, also
    // catches smooth-scroll libraries that move content with transforms.
    frame(seconds, uniforms) {
      const top = container.getBoundingClientRect().top;
      const dt = lastTime === undefined ? 0 : seconds - lastTime;
      const moved = lastTop - top;
      lastTime = seconds;
      lastTop = top;
      // The first frame, or the first after a pause off screen, has no speed.
      if (dt <= 0 || dt > 0.1) {
        bend = rate = 0;
      } else {
        const target = Math.tanh(moved / dt / FAST);
        // Short steps keep the spring stable at low frame rates.
        const steps = Math.ceil(dt / 0.008);
        for (let i = 0; i < steps; i++) {
          rate += ((target - bend) * STIFFNESS - rate * DAMPING) * (dt / steps);
          bend += rate * (dt / steps);
        }
      }
      uniforms.uVelocity.value = bend;
    },
  });
}
