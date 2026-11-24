import { Color } from "ogl";
import { createBackground, type BackgroundController } from "./background";
import { noiseChunk } from "./shaders";

export interface ShaderButtonOptions {
  /** Three hex colors that flow through the button. */
  colors?: [string, string, string];
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export type ShaderButtonController = BackgroundController<ShaderButtonOptions>;

// A flowing fill for a button: three colors carried along by warped noise.
// Hover or focus brightens it, speeds it up and adds a highlight under the
// pointer.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec2 vUv;
${noiseChunk}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * ca, vUv.y);
  float t = uTime * 0.4;
  float n = fbm(p * 1.4 + vec2(t, -t * 0.6));
  float m = fbm(p * 2.1 - vec2(t * 0.8, t * 0.3) + n);
  vec3 col = mix(uC1, uC2, smoothstep(0.25, 0.75, n));
  col = mix(col, uC3, smoothstep(0.45, 0.8, m));

  vec2 d = (vUv - uPointer) * vec2(ca, 1.0);
  float glow = exp(-dot(d, d) * 3.0) * uHover;
  col = col * (0.9 + 0.2 * uHover) + glow * 0.25;
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}
`;

export function createShaderButton(
  container: HTMLElement,
  options: ShaderButtonOptions = {}
): ShaderButtonController {
  return createBackground(container, options, {
    fragment,
    resolve: (o) => ({
      colors: o.colors ?? (["#3b1d8f", "#e0457b", "#f9b44c"] as [string, string, string]),
      speed: o.speed ?? 1,
    }),
    uniforms: (r) => ({
      uC1: new Color(r.colors[0]),
      uC2: new Color(r.colors[1]),
      uC3: new Color(r.colors[2]),
    }),
    fallback: (r) => `linear-gradient(120deg, ${r.colors[0]}, ${r.colors[1]}, ${r.colors[2]})`,
    // Hovering or focusing speeds the flow up.
    speed: (r, hover) => r.speed * (1 + hover * 1.5),
    pointerSpring: { type: "spring", stiffness: 260, damping: 30 },
    hoverTransition: { duration: 0.25 },
  });
}
