import { Mesh, Program, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex } from "./shaders";
import {
  animateTo,
  bindValue,
  createStage,
  disposeResources,
  supportsWebGL,
  type Transition,
} from "./stage";

/**
 * Describes a full-surface shader background. Every background gets the same
 * uniforms for free: uTime (seconds, scaled by speed), uRes (CSS pixels),
 * uPointer (0 to 1, origin at the bottom left) and uHover (0 to 1).
 */
export interface BackgroundSpec<O, R> {
  fragment: string;
  /** Fill in defaults and clamp ranges. */
  resolve(options: O): R;
  /** Uniform values for these options. Called on create and on every update. */
  uniforms(resolved: R): Record<string, unknown>;
  /** CSS `background` value used when WebGL is unavailable. */
  fallback(resolved: R): string;
  /** Time multiplier. Gets the current hover amount, so hovering can speed things up. */
  speed?(resolved: R, hover: number): number;
  pointerSpring?: Transition;
  hoverTransition?: Transition;
}

export interface BackgroundController<O> {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Smoothed with a spring. */
  setPointer(x: number, y: number): void;
  /** Animate the pointer's influence from 0 to 1. */
  setHover(value: number): void;
  /** Apply new options in place, without rebuilding the effect. */
  update(options: O): void;
  destroy(): void;
}

export function createBackground<O, R>(
  container: HTMLElement,
  options: O,
  spec: BackgroundSpec<O, R>
): BackgroundController<O> {
  if (!supportsWebGL()) {
    const paint = (next: O) => {
      container.style.background = spec.fallback(spec.resolve(next));
    };
    paint(options);
    return {
      setPointer() {},
      setHover() {},
      update: paint,
      destroy() {
        container.style.background = "";
      },
    };
  }

  let resolved = spec.resolve(options);
  let program!: Program;
  let mesh!: Mesh;
  // Accumulated so speed changes, including hover boosts, never make it jump.
  let phase = 0;
  let last: number | undefined;
  let hoverNow = 0;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame(seconds) {
      const scale = spec.speed ? spec.speed(resolved, hoverNow) : 1;
      phase += (last === undefined ? seconds : seconds - last) * scale;
      last = seconds;
      program.uniforms.uTime.value = phase;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  const uniforms: Record<string, { value: unknown }> = {
    uTime: { value: 0 },
    uRes: { value: [1, 1] },
    uPointer: { value: [0.5, 0.5] },
    uHover: { value: 0 },
  };
  for (const [name, value] of Object.entries(spec.uniforms(resolved))) {
    uniforms[name] = { value };
  }
  program = new Program(gl, { vertex: gradientVertex, fragment: spec.fragment, uniforms });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const hover = motionValue(0);
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, hover, (v) => {
    hoverNow = v;
    program.uniforms.uHover.value = v;
  });

  stage.start();

  const pointerSpring = spec.pointerSpring ?? { type: "spring", stiffness: 120, damping: 20 };
  const hoverTransition = spec.hoverTransition ?? { duration: 0.5, ease: "easeOut" };

  return {
    setPointer(x, y) {
      animateTo(stage, px, x, pointerSpring);
      animateTo(stage, py, y, pointerSpring);
    },
    setHover(value) {
      animateTo(stage, hover, value, hoverTransition);
    },
    update(next) {
      resolved = spec.resolve(next);
      for (const [name, value] of Object.entries(spec.uniforms(resolved))) {
        program.uniforms[name].value = value;
      }
      stage.invalidate();
    },
    destroy() {
      [px, py, hover].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
