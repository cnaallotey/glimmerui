import { tiltShader } from "./shaders";
import { createTiltEffect, type TiltCardOptions, type TiltEffectController } from "./tilt";

export interface HoloCardOptions extends TiltCardOptions {
  /** Strength of the holographic foil, from 0 to 1. Defaults to 0.8. */
  foil?: number;
}

export type HoloCardController = TiltEffectController<HoloCardOptions>;

// A tilt card with a holographic foil over the image, like a rare trading card.
// The foil's rainbow bands shift as the card tilts, and a scatter of glints
// flashes at particular angles. It shows faintly at rest and fully on hover.
const fragment = tiltShader({
  uniforms: "uniform float uFoil;",
  functions: /* glsl */ `
vec3 hsv(float h, float s, float v) {
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return v * mix(vec3(1.0), k, s);
}
float glintHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}`,
  color: /* glsl */ `
  float amount = uFoil * (0.3 + 0.7 * uHover);
  float hue = fract(dot(uv, vec2(0.55, 0.85)) * 1.6 + (uRot.x - uRot.y) * 0.9 + 0.08 * sin(uv.x * 14.0));
  float band = 0.5 + 0.5 * sin((uv.x + uv.y) * 9.0 + (uRot.y - uRot.x) * 6.0);
  vec3 rainbow = hsv(hue, 0.55, 1.0);
  col = mix(col, col * 0.55 + rainbow * 0.6, amount * band * 0.6);
  // Glints: a few cells hold a small round point that flashes at its own angle.
  vec2 gp = uv * 90.0;
  float cell = glintHash(floor(gp));
  float dotShape = 1.0 - smoothstep(0.08, 0.3, length(fract(gp) - 0.5));
  float glint = step(0.982, cell) * dotShape * pow(0.5 + 0.5 * sin(cell * 60.0 + (uRot.x + uRot.y) * 25.0), 8.0);
  col += glint * amount * 1.4;
`,
});

export function createHoloCard(container: HTMLElement, options: HoloCardOptions): HoloCardController {
  return createTiltEffect(container, options, fragment, (o) => ({
    uFoil: Math.min(1, Math.max(0, o.foil ?? 0.8)),
  }));
}
