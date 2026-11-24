import { createBackground, noiseChunk } from "@glimmerui/core";

// A ring of liquid chrome around a badge or button. The effect fills the
// wrapper; the element inside covers all but a thin edge, which is what shows.
//
// It works like LiquidMetal: a moving surface gives a normal, and the normal
// reflects a studio of soft bands. Here the surface is drifting noise, raised
// into a bump under the pointer, and each color channel reflects a slightly
// different direction, which leaves thin fringes where the bands meet.

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uHover;
varying vec2 vUv;
${noiseChunk}
// CSS pixels in one unit of the surface.
const float UNIT = 44.0;

float surface(vec2 p) {
  float h = noise(p + vec2(uTime * 0.35, -uTime * 0.2));
  h += 0.5 * noise(p * 1.7 - vec2(uTime * 0.25, 0.0) + 8.3);
  vec2 d = p - uPointer * uRes / UNIT;
  return h + uHover * 0.9 * exp(-0.5 * dot(d, d));
}

// The bands LiquidMetal reflects, a little darker so the ring still reads
// against a white page.
float studio(vec3 r) {
  float bands = 0.5 + 0.5 * sin(r.y * 5.0 + r.x * 3.0 + 1.0);
  return mix(0.06, 0.84, smoothstep(0.25, 0.85, bands));
}

void main() {
  vec2 p = vUv * uRes / UNIT;
  float s = 0.06;
  vec2 g = vec2(
    surface(p + vec2(s, 0.0)) - surface(p - vec2(s, 0.0)),
    surface(p + vec2(0.0, s)) - surface(p - vec2(0.0, s))
  ) / (2.0 * s);

  vec3 n = normalize(vec3(-g * 0.8, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  vec3 shift = vec3(0.014, 0.014, 0.0);
  vec3 metal = vec3(studio(r - shift), studio(r), studio(r + shift));
  float spec = pow(max(dot(r, normalize(vec3(-0.45, 0.6, 0.65))), 0.0), 40.0);
  gl_FragColor = vec4(metal + 0.12 * spec, 1.0);
}
`;

/** Starts the chrome ring on every element marked data-chrome. */
export function mountChrome(root: ParentNode = document): void {
  for (const wrap of root.querySelectorAll<HTMLElement>("[data-chrome]")) {
    const host = document.createElement("span");
    host.className = "mk-chrome-fx";
    host.setAttribute("aria-hidden", "true");
    wrap.prepend(host);

    const chrome = createBackground(host, {}, {
      fragment,
      resolve: (options) => options,
      uniforms: () => ({}),
      fallback: () => "linear-gradient(120deg, #26252b, #d0cfd6 30%, #6f6e78 55%, #d8d7de 75%, #3a3942)",
      speed: (_, hover) => 1 + hover * 1.5,
    });

    const point = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      chrome.setPointer((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    wrap.addEventListener("pointerenter", (e) => {
      point(e);
      chrome.setHover(1);
    });
    wrap.addEventListener("pointermove", point);
    wrap.addEventListener("pointerleave", () => chrome.setHover(0));
    // Keyboard focus lights it up too.
    wrap.addEventListener("focusin", () => chrome.setHover(1));
    wrap.addEventListener("focusout", () => chrome.setHover(0));
  }
}
