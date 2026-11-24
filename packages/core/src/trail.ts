import { Color, Mesh, Program, Triangle } from "ogl";
import { gradientVertex } from "./shaders";
import { createStage, disposeResources, prefersReducedMotion, supportsWebGL } from "./stage";

export interface CursorTrailOptions {
  /** Color at the head of the trail, as a hex value. */
  color?: string;
  /** Color at the end of the trail, as a hex value. */
  tail?: string;
  /** Width of the trail at its head, in CSS pixels. */
  width?: number;
  /** How long the trail is, from 4 to 40 segments. */
  length?: number;
}

export interface CursorTrailController {
  /** Apply new options in place. */
  update(options: CursorTrailOptions): void;
  destroy(): void;
}

const MAX_POINTS = 40;

// A glowing trail behind the cursor: a chain of points, each easing toward the
// one ahead of it, drawn as a soft line that thins and fades toward its end.
const fragment = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform vec2 uPoints[${MAX_POINTS}];
uniform float uCount;
uniform float uWidth;
uniform float uFade;
uniform vec3 uColor;
uniform vec3 uTail;
varying vec2 vUv;
void main() {
  vec2 px = vUv * uRes;
  float best = 1e6;
  float along = 0.0;
  for (int i = 0; i < ${MAX_POINTS - 1}; i++) {
    float fi = float(i);
    if (fi >= uCount - 1.0) break;
    vec2 a = uPoints[i];
    vec2 b = uPoints[i + 1];
    vec2 pa = px - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    float d = length(pa - ba * h);
    if (d < best) {
      best = d;
      along = (fi + h) / (uCount - 1.0);
    }
  }
  float w = uWidth * (1.0 - along * 0.85);
  float core = exp(-(best * best) / (w * w * 0.25));
  float glow = exp(-(best * best) / (w * w * 2.5)) * 0.45;
  float a = (core + glow) * (1.0 - along) * uFade;
  gl_FragColor = vec4(mix(uColor, uTail, along), clamp(a, 0.0, 1.0));
}
`;

/**
 * A glowing trail that follows the mouse across the whole page. `container`
 * should be a fixed, full-viewport element that ignores pointer events. The
 * effect listens to the window itself, pauses once the cursor has been still
 * for a moment, and stays off when the user prefers reduced motion or the page
 * is used by touch.
 */
export function createCursorTrail(
  container: HTMLElement,
  options: CursorTrailOptions = {}
): CursorTrailController {
  const resolve = (o: CursorTrailOptions) => ({
    color: o.color ?? "#e0457b",
    tail: o.tail ?? "#f9b44c",
    width: Math.max(1, o.width ?? 10),
    length: Math.min(MAX_POINTS, Math.max(4, Math.round(o.length ?? 20))),
  });

  // A trail is pure motion, so there's nothing to show without WebGL or with
  // reduced motion.
  if (!supportsWebGL() || prefersReducedMotion()) {
    return { update() {}, destroy() {} };
  }

  let o = resolve(options);
  let program!: Program;
  let mesh!: Mesh;
  let height = 1;
  // A plain array: OGL only maps array uniforms (uPoints[0], [1], ...) from JS arrays.
  const points: number[] = new Array(MAX_POINTS * 2).fill(0);
  let target: [number, number] | null = null;
  let fade = 0;
  let lastMove = 0;
  let last: number | undefined;

  const stage = createStage(container, {
    onResize(w, h) {
      height = h;
      program.uniforms.uRes.value = [w, h];
    },
    onFrame(seconds) {
      const dt = last === undefined ? 1 / 60 : Math.min(seconds - last, 0.05);
      last = seconds;
      if (target) {
        // The head chases the cursor; each point chases the one ahead of it.
        const k0 = 1 - Math.exp(-dt * 40);
        const k = 1 - Math.exp(-dt * 28);
        points[0] += (target[0] - points[0]) * k0;
        points[1] += (target[1] - points[1]) * k0;
        for (let i = 1; i < o.length; i++) {
          points[i * 2] += (points[i * 2 - 2] - points[i * 2]) * k;
          points[i * 2 + 1] += (points[i * 2 - 1] - points[i * 2 + 1]) * k;
        }
      }
      // Fade out once the cursor has been still for a moment, then pause.
      const idle = performance.now() - lastMove > 600;
      fade += ((idle ? 0 : 1) - fade) * (1 - Math.exp(-dt * (idle ? 3 : 12)));
      if (idle && fade < 0.01) {
        fade = 0;
        stage.setPaused(true);
      }
      program.uniforms.uFade.value = fade;
      program.uniforms.uPoints.value = points;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  program = new Program(gl, {
    vertex: gradientVertex,
    fragment,
    uniforms: {
      uRes: { value: [1, 1] },
      uPoints: { value: points },
      uCount: { value: o.length },
      uWidth: { value: o.width },
      uFade: { value: 0 },
      uColor: { value: new Color(o.color) },
      uTail: { value: new Color(o.tail) },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = height - (e.clientY - rect.top);
    if (!target) {
      // Start the whole chain at the cursor so the first frame isn't a streak.
      for (let i = 0; i < MAX_POINTS; i++) {
        points[i * 2] = x;
        points[i * 2 + 1] = y;
      }
    }
    target = [x, y];
    lastMove = performance.now();
    stage.setPaused(false);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  stage.start();
  stage.setPaused(true);

  return {
    update(next) {
      o = resolve(next);
      program.uniforms.uCount.value = o.length;
      program.uniforms.uWidth.value = o.width;
      program.uniforms.uColor.value = new Color(o.color);
      program.uniforms.uTail.value = new Color(o.tail);
    },
    destroy() {
      window.removeEventListener("pointermove", onMove);
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
