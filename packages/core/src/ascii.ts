import { Color, Texture } from "ogl";
import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { coverChunk } from "./shaders";

export interface AsciiImageOptions extends ImageEffectBaseOptions {
  /** Size of each character cell, in CSS pixels. Defaults to 10. */
  cell?: number;
  /** Character color, as a hex value. */
  color?: string;
  /** Background color, as a hex value. */
  background?: string;
  /** Color each character with the image's own color there, instead of `color`. */
  colored?: boolean;
  /** Radius of the area around the pointer where the real image shows, in CSS pixels. */
  radius?: number;
}

export type AsciiImageController = ImageEffectController<AsciiImageOptions>;

/** Characters from sparse to dense. Brighter parts of the image get denser characters. */
// Avoid "%": at small sizes it reads as an arrow.
const GLYPHS = " .:-=+*o#@";
const GLYPH_SIZE = 48;

// Draws the characters into a single row of square cells, white on black.
function glyphAtlas(gl: Texture["gl"]) {
  const canvas = document.createElement("canvas");
  canvas.width = GLYPH_SIZE * GLYPHS.length;
  canvas.height = GLYPH_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${GLYPH_SIZE * 0.82}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [...GLYPHS].forEach((glyph, i) => ctx.fillText(glyph, (i + 0.5) * GLYPH_SIZE, GLYPH_SIZE * 0.54));
  return new Texture(gl, { image: canvas, generateMipmaps: false });
}

// Each cell shows one character, picked by the image's brightness at the cell's
// center. Around the pointer the real image shows through.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform sampler2D uGlyphs;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uCell;
uniform vec3 uInk;
uniform vec3 uBg;
uniform float uColored;
uniform float uRadius;
varying vec2 vUv;
${coverChunk}
const float COUNT = ${GLYPHS.length}.0;
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;
  vec2 cell = floor(px / uCell);
  vec3 src = image((cell + 0.5) * uCell / uRes, ca);
  float lum = dot(src, vec3(0.299, 0.587, 0.114));
  float index = floor(clamp(lum, 0.0, 0.999) * COUNT);
  vec2 local = fract(px / uCell);
  float glyph = texture2D(uGlyphs, vec2((index + local.x) / COUNT, local.y)).r;

  vec3 ink = mix(uInk, min(src * 1.25, vec3(1.0)), uColored);
  // In colored mode each cell also gets a dim wash of its color, so dark
  // colored areas, which get sparse characters, keep their hue.
  vec3 cellBg = mix(uBg, uBg + src * 0.35, uColored);
  vec3 ascii = mix(cellBg, ink, glyph);

  float d = distance(px, uPointer * uRes);
  float reveal = (1.0 - smoothstep(uRadius * 0.55, uRadius, d)) * uHover;
  vec3 col = mix(ascii, image(vUv, ca), reveal);
  gl_FragColor = vec4(mix(uBg, col, uLoaded), 1.0);
}
`;

export function createAsciiImage(container: HTMLElement, options: AsciiImageOptions): AsciiImageController {
  return createImageEffect(container, options, {
    fragment,
    resolve: (o) => ({
      cell: Math.max(4, o.cell ?? 10),
      color: o.color ?? "#e9e8ee",
      background: o.background ?? "#0e0d12",
      colored: o.colored ?? false,
      radius: o.radius ?? 140,
    }),
    uniforms: (r) => ({
      uCell: r.cell,
      uInk: new Color(r.color),
      uBg: new Color(r.background),
      uColored: r.colored ? 1 : 0,
      uRadius: r.radius,
    }),
    setup: (gl) => ({ uGlyphs: glyphAtlas(gl) }),
  });
}
