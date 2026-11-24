// Ray traces each pixel onto a tilted plane, so edges stay anti aliased and the
// perspective is exact. GLSL ES 1.00 has no transpose, so the inverse rotation is
// built from negated angles.
/** Hooks for effects built on the tilt card: extra uniforms, helper functions, and code that adjusts `col` before output. */
export interface TiltShaderHooks {
  uniforms?: string;
  functions?: string;
  color?: string;
}

export function tiltShader(hooks: TiltShaderHooks = {}) {
  return /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uImgAspect;
uniform vec2 uRot;
uniform vec2 uPointer;
uniform float uHover;
uniform float uInset;
uniform float uRadius;
uniform float uGlare;
uniform float uLoaded;
${hooks.uniforms ?? ""}
varying vec2 vUv;

mat3 rotX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}
mat3 rotY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}
${hooks.functions ?? ""}

void main() {
  float ca = uRes.x / uRes.y;
  vec2 c = (vUv * 2.0 - 1.0) * vec2(ca, 1.0);

  mat3 R = rotY(uRot.y) * rotX(uRot.x);
  mat3 Rinv = rotX(-uRot.x) * rotY(-uRot.y);
  vec3 n = R * vec3(0.0, 0.0, 1.0);

  vec3 o = vec3(0.0, 0.0, 3.0);
  vec3 d = vec3(c, -3.0);
  float denom = dot(d, n);
  float t = -dot(o, n) / denom;
  if (t <= 0.0 || abs(denom) < 0.0001) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec3 P = o + t * d;
  vec2 l = (Rinv * P).xy;

  vec2 halfSize = vec2(ca * uInset, uInset);
  vec2 uv = l / halfSize * 0.5 + 0.5;

  // Rounded rectangle in pixels for a crisp anti aliased edge.
  float ppu = uRes.y * 0.5;
  vec2 q = abs(l) * ppu - halfSize * ppu + uRadius;
  float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float alpha = 1.0 - smoothstep(-0.75, 0.75, sdf);

  vec2 s = vec2(1.0);
  if (ca > uImgAspect) s.y = uImgAspect / ca;
  else s.x = ca / uImgAspect;
  vec2 tuv = (uv - 0.5) * s + 0.5;

  vec3 col = texture2D(uTex, tuv).rgb;
  col = mix(vec3(0.08), col, uLoaded);

  float shade = 0.92 + 0.16 * dot(n, normalize(vec3(-0.3, 0.4, 0.85)));
  float glare = pow(max(0.0, 1.0 - distance(uv, uPointer) * 1.5), 2.5) * uHover * uGlare * 0.5;
  col = col * shade + glare;
${hooks.color ?? ""}
  gl_FragColor = vec4(col, alpha);
}
`;
}

export const tiltFragment = tiltShader();

export const distortionFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uRes;
uniform float uImgAspect;
uniform vec2 uPointer;
uniform float uHover;
uniform float uStrength;
uniform float uLoaded;
varying vec2 vUv;

void main() {
  // Cover fit: crop the image to fill the container without stretching.
  float ca = uRes.x / uRes.y;
  vec2 s = vec2(1.0);
  if (ca > uImgAspect) s.y = uImgAspect / ca;
  else s.x = ca / uImgAspect;
  vec2 base = (vUv - 0.5) * s + 0.5;

  // Ripple that radiates from the pointer and fades with distance.
  vec2 dir = (vUv - uPointer) * vec2(ca, 1.0);
  float d = length(dir);
  vec2 n = dir / max(d, 0.0001);
  float amp = uHover * uStrength;
  float ripple = sin(d * 28.0 - uTime * 4.0) * exp(-d * 4.5) * amp;
  vec2 offset = n * ripple * 0.035 * s;

  // Color split grows with the ripple.
  vec2 split = n * ripple * 0.02 * s;
  float r = texture2D(uTex, base + offset + split).r;
  float g = texture2D(uTex, base + offset).g;
  float b = texture2D(uTex, base + offset - split).b;

  vec3 col = vec3(r, g, b);
  gl_FragColor = vec4(mix(vec3(0.04, 0.04, 0.06), col, uLoaded), 1.0);
}
`;

export const gradientVertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const gradientFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uIntensity;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uRes.x / uRes.y;

  float d = distance(uv, uPointer);
  p += (uPointer - 0.5) * 0.35 * uIntensity;

  float t = uTime * 0.2;
  float a = sin(p.x * 2.0 + t)
          + sin(p.y * 3.0 - t * 1.3)
          + sin((p.x + p.y) * 2.0 + t * 0.7)
          + (1.0 - smoothstep(0.0, 0.6, d)) * uIntensity * 1.5;

  float m = 0.5 + 0.5 * sin(a * 1.5);
  vec3 col = mix(uC1, uC2, m);
  col = mix(col, uC3, smoothstep(0.3, 1.0, 0.5 + 0.5 * sin(a * 2.0 + 2.0)));

  gl_FragColor = vec4(col, 1.0);
}
`;

// Value noise and fractal noise, shared by the shaders below.
export const noiseChunk = /* glsl */ `
// "Hash without Sine" by Dave Hoskins (MIT). Its small multipliers keep
// rounding differences tiny, so neighbouring grid cells always agree on the
// value at their shared corners. Hashes built on large multipliers can turn the
// GPU's last-bit rounding differences into visible seams along the grid.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02 + 17.1;
    a *= 0.5;
  }
  return v;
}
`;

// Crops an image to cover a box without stretching, like object-fit: cover.
export const coverChunk = /* glsl */ `
vec2 coverUv(vec2 uv, float boxAspect, float imgAspect) {
  vec2 s = vec2(1.0);
  if (boxAspect > imgAspect) s.y = imgAspect / boxAspect;
  else s.x = boxAspect / imgAspect;
  return (uv - 0.5) * s + 0.5;
}
`;

// Dissolves from image A to image B through a noisy edge that spreads from the pointer.
export const revealFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uAspectA;
uniform float uAspectB;
uniform float uLoadedA;
uniform float uLoadedB;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;
${noiseChunk}
${coverChunk}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 pa = vUv * vec2(ca, 1.0);
  vec2 pp = uPointer * vec2(ca, 1.0);
  float d = distance(pa, pp);

  // The farthest corner from the pointer, so a full reveal covers everything.
  float far = max(
    max(distance(pp, vec2(0.0)), distance(pp, vec2(ca, 0.0))),
    max(distance(pp, vec2(0.0, 1.0)), distance(pp, vec2(ca, 1.0)))
  );
  float soft = 0.18;
  float edge = mix(-soft - 0.25, far + soft + 0.25, uProgress);
  float n = fbm(pa * 3.0 + uTime * 0.15) - 0.5;
  float m = (1.0 - smoothstep(edge - soft, edge, d + n * 0.35)) * uLoadedB;

  // Bend both images a little along the moving edge.
  float band = m * (1.0 - m) * 4.0;
  vec2 dir = (pa - pp) / max(d, 0.0001);
  vec2 off = dir / vec2(ca, 1.0) * band * 0.03;

  vec3 a = texture2D(uTexA, coverUv(vUv + off, ca, uAspectA)).rgb;
  vec3 b = texture2D(uTexB, coverUv(vUv - off, ca, uAspectB)).rgb;
  a = mix(vec3(0.04, 0.04, 0.06), a, uLoadedA);
  vec3 col = mix(a, b, m) + band * 0.08;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Evenly spaced dots that swell, tint and part around the pointer. Draws on a
// transparent background, so the element's own background shows through.
export const dotGridFragment = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uSpacing;
uniform float uSize;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 px = vUv * uRes;
  vec2 toP = px - uPointer * uRes;
  float d = length(toP);
  float infl = exp(-(d * d) / (uRadius * uRadius)) * uHover;

  // Sample closer to the pointer, so the dots appear pushed away from it.
  vec2 q = px - toP / max(d, 0.001) * infl * uSpacing * 0.6;
  vec2 cellPos = q - mod(uRes, uSpacing) * 0.5;
  vec2 id = floor(cellPos / uSpacing);
  vec2 local = cellPos - (id + 0.5) * uSpacing;

  float wave = 0.5 + 0.5 * sin(uTime * 1.1 - (id.x + id.y) * 0.35);
  float r = uSize * (1.0 + 0.3 * wave) * (1.0 + infl * 1.6);
  float alpha = 1.0 - smoothstep(r - 0.6, r + 0.6, length(local));
  gl_FragColor = vec4(mix(uColor, uAccent, infl), alpha);
}
`;

// Curtains of light over a night sky. Each curtain is brightest at its lower
// edge and fades upward, with fine vertical rays. The pointer pulls nearby light.
export const auroraFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uIntensity;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uBg;
varying vec2 vUv;
${noiseChunk}
vec3 curtain(vec2 p, float t, float base, float seed, vec3 color) {
  // A wandering lower edge: slow large folds plus smaller ripples.
  float edge = base
    + 0.5 * (fbm(vec2(p.x * 0.7 + seed, t * 0.5 + seed)) - 0.5)
    + 0.04 * sin(p.x * 4.0 + t * 3.0 + seed);
  float h = p.y - edge;
  // Brightest just above the edge, fading upward.
  float glow = smoothstep(-0.05, 0.02, h) * exp(-max(h, 0.0) * 8.0);
  // Fine vertical rays, and patches where the curtain thins out.
  float rays = 0.5 + 0.5 * fbm(vec2(p.x * 16.0 + seed * 3.0 + t * 0.8, t * 0.4));
  float density = smoothstep(0.3, 0.65, fbm(vec2(p.x * 0.9 - t * 0.4 + seed, seed)));
  return color * glow * rays * density * 1.6;
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * ca, vUv.y);
  vec2 pp = vec2(uPointer.x * ca, uPointer.y);
  float t = uTime * 0.1;

  float near = exp(-dot(p - pp, p - pp) * 6.0) * uIntensity;
  p.x += (pp.x - p.x) * near * 0.35;

  vec3 light = curtain(p, t, 0.35, 0.0, uC1)
    + curtain(p, t * 1.3, 0.5, 4.7, uC2) * 0.8
    + curtain(p, t * 0.8, 0.62, 9.1, uC3) * 0.6;
  // Soft roll-off instead of hard clipping where curtains overlap.
  vec3 col = uBg + (1.0 - exp(-light * 1.5)) * (1.0 - uBg);
  gl_FragColor = vec4(col, 1.0);
}
`;

// A round convex lens that follows the pointer, magnifying the image beneath it
// with color fringing toward the rim, a rim light and a soft shadow.
export const lensFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uZoom;
uniform float uSize;
uniform float uFringe;
varying vec2 vUv;
${coverChunk}
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;
  vec2 c = uPointer * uRes;
  float d = distance(px, c);
  float R = uSize * uHover;

  vec3 col = image(vUv, ca);
  if (R > 0.5) {
    float k = clamp(d / R, 0.0, 1.0);
    // Full magnification at the center, easing back to 1x at the rim.
    float scale = mix(1.0 / uZoom, 1.0, k * k * k);
    vec2 dir = vUv - uPointer;
    vec2 lensUv = uPointer + dir * scale;
    vec2 fringe = dir * k * k * 0.04 * uFringe;
    vec3 lens = vec3(
      image(lensUv + fringe, ca).r,
      image(lensUv, ca).g,
      image(lensUv - fringe, ca).b
    );
    float rim = smoothstep(0.82, 1.0, k) * 0.18;
    vec2 hl = (px - c) / R - vec2(-0.35, 0.35);
    lens += rim + exp(-dot(hl, hl) * 6.0) * 0.12;

    float inside = 1.0 - smoothstep(R - 1.0, R + 1.0, d);
    float shadow = (1.0 - smoothstep(R, R * 1.25, d)) * (1.0 - inside) * 0.25;
    col = mix(col * (1.0 - shadow), lens, inside);
  }
  col = mix(vec3(0.04, 0.04, 0.06), col, uLoaded);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Chrome metaballs. Blobs drift on slow looping paths; the pointer adds one
// more. The field's gradient gives a surface normal, which reflects a simple
// studio environment of soft bands and one sharp highlight.
export const liquidMetalFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uCount;
uniform vec3 uTint;
uniform vec3 uBg;
varying vec2 vUv;

void blob(vec2 p, vec2 c, float r, inout float f, inout vec2 g) {
  vec2 d = p - c;
  float q = dot(d, d) + 0.0001;
  float k = r * r / q;
  f += k;
  g += -2.0 * k * d / q;
}

void main() {
  float ca = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(ca, 1.0);
  float t = uTime * 0.25;

  float f = 0.0;
  vec2 g = vec2(0.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    if (fi >= uCount) break;
    vec2 c = vec2(
      sin(t * (0.7 + fi * 0.13) + fi * 2.1) * 0.42 * ca,
      cos(t * (0.9 + fi * 0.11) + fi * 1.3) * 0.32
    );
    blob(p, c, 0.15 + 0.05 * sin(fi * 3.7), f, g);
  }
  blob(p, (uPointer - 0.5) * vec2(ca, 1.0), 0.17 * uHover, f, g);

  // Smooth edge from the field itself, about a pixel wide.
  float w = 0.06;
  float m = smoothstep(1.0 - w, 1.0 + w, f);

  vec3 n = normalize(vec3(-g * 0.06, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  float bands = 0.5 + 0.5 * sin(r.y * 5.0 + r.x * 1.5 + 1.0);
  vec3 env = mix(vec3(0.05), vec3(0.95), smoothstep(0.25, 0.85, bands));
  env *= 0.55 + 0.45 * n.z;
  float spec = pow(max(dot(r, normalize(vec3(-0.45, 0.6, 0.65))), 0.0), 40.0);
  vec3 metal = env * uTint + spec;

  gl_FragColor = vec4(mix(uBg, metal, m), 1.0);
}
`;

// A print-style halftone: one dot per cell on a 45 degree grid, sized by how
// dark the image is there. Near the pointer the full-color image shows through.
export const halftoneFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uCell;
uniform float uRadius;
uniform vec3 uInk;
uniform vec3 uPaper;
varying vec2 vUv;
${coverChunk}
vec3 image(vec2 uv, float ca) {
  return texture2D(uTex, coverUv(uv, ca, uImgAspect)).rgb;
}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;

  // Rotate into the screen's 45 degree grid, find this cell's center, rotate back.
  const float s = 0.70710678;
  mat2 rot = mat2(s, s, -s, s);
  mat2 inv = mat2(s, -s, s, s);
  vec2 q = rot * px;
  vec2 center = inv * ((floor(q / uCell) + 0.5) * uCell);

  vec3 sampleCol = image(center / uRes, ca);
  float lum = dot(sampleCol, vec3(0.299, 0.587, 0.114));
  float r = sqrt(1.0 - lum) * uCell * 0.72;
  float dotMask = 1.0 - smoothstep(r - 0.75, r + 0.75, distance(px, center));
  vec3 halftone = mix(uPaper, uInk, dotMask);

  float d = distance(px, uPointer * uRes);
  float reveal = (1.0 - smoothstep(uRadius * 0.55, uRadius, d)) * uHover;
  vec3 col = mix(halftone, image(vUv, ca), reveal);
  col = mix(uPaper, col, uLoaded);
  gl_FragColor = vec4(col, 1.0);
}
`;

// A mosaic of blocks that get finer near the pointer, in power-of-two steps so
// each ring of resolution lines up with the next.
export const pixelFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uImgAspect;
uniform float uLoaded;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uBlock;
uniform float uRadius;
varying vec2 vUv;
${coverChunk}
void main() {
  float ca = uRes.x / uRes.y;
  vec2 px = vUv * uRes;
  float d = distance(px, uPointer * uRes);
  float sharpen = (1.0 - smoothstep(uRadius * 0.35, uRadius, d)) * uHover;

  float size = max(1.0, uBlock * (1.0 - sharpen));
  size = exp2(floor(log2(size) + 0.5));
  vec2 center = (floor(px / size) + 0.5) * size;
  vec3 col = texture2D(uTex, coverUv(center / uRes, ca, uImgAspect)).rgb;

  col = mix(vec3(0.04, 0.04, 0.06), col, uLoaded);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Particles: each point's position comes from its random seed and the time, so
// no state is kept between frames. The pointer pulls nearby points into a
// slowly turning swirl.
export const particleVertex = /* glsl */ `
attribute vec3 seed;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
uniform float uSize;
uniform float uScale;
uniform float uRadius;
varying float vPull;
void main() {
  float ca = uRes.x / uRes.y;
  vec2 vel = (seed.yz - 0.5) * 0.02;
  vec2 p = fract(seed.xy + vel * uTime + 0.01 * sin(uTime * 0.6 + seed.z * 6.2831));

  vec2 toP = (uPointer - p) * vec2(ca, 1.0);
  float d = length(toP);
  float rad = uRadius / uRes.y;
  float pull = exp(-(d * d) / (rad * rad)) * uHover;
  vec2 swirl = vec2(-toP.y, toP.x);
  p += (toP * 0.55 + swirl * 0.35) * pull / vec2(ca, 1.0);

  vPull = pull;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = uSize * uScale * (1.0 + pull * 0.8) * (0.6 + 0.8 * seed.z);
}
`;

export const particleFragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform vec3 uAccent;
varying float vPull;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = 1.0 - smoothstep(0.35, 0.5, d);
  if (alpha <= 0.0) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, clamp(vPull * 1.5, 0.0, 1.0)), alpha);
}
`;
