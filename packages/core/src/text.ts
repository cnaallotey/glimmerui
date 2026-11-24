import { Color, Mesh, Program, Texture, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex, noiseChunk } from "./shaders";
import { animateTo, bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

export interface ShaderTextOptions {
  /** The text to draw. Use "\n" for line breaks; lines don't wrap. */
  text: string;
  /** Three hex colors that flow through the letters. */
  colors?: [string, string, string];
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export interface ShaderTextController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. */
  setPointer(x: number, y: number): void;
  /** Animate the pointer highlight from 0 to 1. */
  setHover(value: number): void;
  /** Apply new options in place. A new text redraws the letter mask. */
  update(options: ShaderTextOptions): void;
  destroy(): void;
}

const DEFAULT_COLORS: [string, string, string] = ["#3b1d8f", "#e0457b", "#f9b44c"];

// Fills a mask of the text with flowing color: the same warped-noise flow as
// ShaderButton, plus a highlight that follows the pointer. Outside the letters
// the canvas is transparent.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uMask;
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
  float mask = texture2D(uMask, vUv).r;
  if (mask <= 0.0) discard;
  float ca = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * ca, vUv.y);
  float t = uTime * 0.3;
  float n = fbm(p * 1.2 + vec2(t, -t * 0.5));
  float m = fbm(p * 1.9 - vec2(t * 0.7, t * 0.2) + n);
  vec3 col = mix(uC1, uC2, smoothstep(0.25, 0.75, n));
  col = mix(col, uC3, smoothstep(0.45, 0.8, m));
  vec2 d = (vUv - uPointer) * vec2(ca, 1.0);
  col += exp(-dot(d, d) * 6.0) * uHover * 0.35;
  gl_FragColor = vec4(min(col, vec3(1.0)), mask);
}
`;

/**
 * Draws flowing color inside text. The effect mirrors `textElement`: it draws
 * the text in that element's font, at that element's position, so the visible
 * letters line up with real (transparent) text that stays selectable and is
 * read by screen readers. Without `textElement` it draws at the top left in the
 * container's font.
 */
export function createShaderText(
  container: HTMLElement,
  options: ShaderTextOptions,
  textElement?: HTMLElement
): ShaderTextController {
  let current = options;
  const fontSource = textElement ?? container;

  // Fallback: show the real text with a CSS gradient clipped to the letters.
  if (!supportsWebGL()) {
    const paint = () => {
      if (!textElement) return;
      const c = current.colors ?? DEFAULT_COLORS;
      Object.assign(textElement.style, {
        backgroundImage: `linear-gradient(100deg, ${c[0]}, ${c[1]}, ${c[2]})`,
        webkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      });
    };
    paint();
    return {
      setPointer() {},
      setHover() {},
      update(next) {
        current = next;
        paint();
      },
      destroy() {
        if (textElement) textElement.style.backgroundImage = "";
      },
    };
  }

  let program!: Program;
  let mesh!: Mesh;
  let texture!: Texture;
  let size = { w: 1, h: 1, scale: 1 };
  let phase = 0;
  let last: number | undefined;
  const maskCanvas = document.createElement("canvas");

  // Redraws the letter mask to match the text's current font and position.
  const drawMask = () => {
    const { w, h, scale } = size;
    maskCanvas.width = Math.max(1, Math.round(w * scale));
    maskCanvas.height = Math.max(1, Math.round(h * scale));
    const ctx = maskCanvas.getContext("2d")!;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const style = getComputedStyle(fontSource);
    const fontSize = parseFloat(style.fontSize) || 16;
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    // Place the baseline the way CSS does: the font's ascent plus descent is
    // centered in each line, with the leftover line height split above and below.
    const metrics = ctx.measureText("Mg");
    const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2;
    const lineHeight = style.lineHeight === "normal" ? ascent + descent : parseFloat(style.lineHeight) || fontSize * 1.2;
    const baseline = (lineHeight - (ascent + descent)) / 2 + ascent;
    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    }
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";

    let originX = 0;
    let firstBaseline = baseline;
    if (textElement) {
      const box = container.getBoundingClientRect();
      originX = textElement.getBoundingClientRect().left - box.left;
      // Measure the real first baseline: a zero-height inline block sits on it.
      const marker = document.createElement("span");
      marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      textElement.insertBefore(marker, textElement.firstChild);
      firstBaseline = marker.getBoundingClientRect().top - box.top;
      marker.remove();
    }
    current.text.split("\n").forEach((line, i) => {
      ctx.fillText(line, originX, firstBaseline + i * lineHeight);
    });
    texture.image = maskCanvas;
    texture.needsUpdate = true;
  };

  const stage = createStage(container, {
    onResize(w, h, scale) {
      size = { w, h, scale };
      program.uniforms.uRes.value = [w, h];
      drawMask();
    },
    onFrame(seconds) {
      phase += (last === undefined ? seconds : seconds - last) * (current.speed ?? 1);
      last = seconds;
      program.uniforms.uTime.value = phase;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  texture = new Texture(gl, { generateMipmaps: false });
  const colors = (o: ShaderTextOptions) => o.colors ?? DEFAULT_COLORS;
  program = new Program(gl, {
    vertex: gradientVertex,
    fragment,
    uniforms: {
      uMask: { value: texture },
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uC1: { value: new Color(colors(options)[0]) },
      uC2: { value: new Color(colors(options)[1]) },
      uC3: { value: new Color(colors(options)[2]) },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const hover = motionValue(0);
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, hover, (v) => (program.uniforms.uHover.value = v));

  stage.start();

  // Web fonts may arrive after the first draw; redraw once they have.
  let destroyed = false;
  document.fonts?.ready.then(() => {
    if (destroyed) return;
    drawMask();
    stage.invalidate();
  });

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 160, damping: 24 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { duration: 0.4 });
    },
    update(next) {
      const textChanged = next.text !== current.text;
      current = next;
      const c = colors(next);
      program.uniforms.uC1.value = new Color(c[0]);
      program.uniforms.uC2.value = new Color(c[1]);
      program.uniforms.uC3.value = new Color(c[2]);
      if (textChanged) drawMask();
      stage.invalidate();
    },
    destroy() {
      destroyed = true;
      [px, py, hover].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, texture, geometry });
      stage.destroy();
    },
  };
}
