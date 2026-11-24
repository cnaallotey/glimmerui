import { Color, Mesh, Program, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex, liquidMetalFragment } from "./shaders";
import { animateTo, bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

export interface LiquidMetalOptions {
  /** Number of blobs, from 1 to 12. */
  count?: number;
  /** Color the chrome is tinted with, as a hex value. White gives plain chrome. */
  tint?: string;
  /** Color behind the blobs, as a hex value. */
  background?: string;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
}

export interface LiquidMetalController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. The pointer's blob follows it. */
  setPointer(x: number, y: number): void;
  /** Grow (1) or shrink (0) the pointer's blob. */
  setHover(value: number): void;
  /** Apply new options in place, without rebuilding the effect. */
  update(options: LiquidMetalOptions): void;
  destroy(): void;
}

const DEFAULTS = { count: 6, tint: "#ffffff", background: "#0e0d12", speed: 1 };

function resolve(o: LiquidMetalOptions) {
  return {
    count: Math.min(12, Math.max(1, Math.round(o.count ?? DEFAULTS.count))),
    tint: o.tint ?? DEFAULTS.tint,
    background: o.background ?? DEFAULTS.background,
    speed: o.speed ?? DEFAULTS.speed,
  };
}

export function createLiquidMetal(
  container: HTMLElement,
  options: LiquidMetalOptions = {}
): LiquidMetalController {
  // CSS fallback: soft gray highlights over the background color.
  if (!supportsWebGL()) {
    const paint = (next: LiquidMetalOptions) => {
      const o = resolve(next);
      container.style.background = [
        "radial-gradient(circle at 35% 40%, #f4f4f6 0, #8e9099 12%, transparent 24%)",
        "radial-gradient(circle at 65% 60%, #f4f4f6 0, #8e9099 10%, transparent 20%)",
        o.background,
      ].join(", ");
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

  let o = resolve(options);
  let program!: Program;
  let mesh!: Mesh;
  // Accumulated so a speed change keeps the blobs where they are.
  let phase = 0;
  let last: number | undefined;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame(seconds) {
      phase += (last === undefined ? seconds : seconds - last) * o.speed;
      last = seconds;
      program.uniforms.uTime.value = phase;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  program = new Program(gl, {
    vertex: gradientVertex,
    fragment: liquidMetalFragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uCount: { value: o.count },
      uTint: { value: new Color(o.tint) },
      uBg: { value: new Color(o.background) },
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

  return {
    setPointer(x, y) {
      // Loose, so the pointer's blob trails like something liquid.
      const spring = { type: "spring", stiffness: 70, damping: 14 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { type: "spring", stiffness: 90, damping: 16 });
    },
    update(next) {
      o = resolve(next);
      program.uniforms.uCount.value = o.count;
      program.uniforms.uTint.value = new Color(o.tint);
      program.uniforms.uBg.value = new Color(o.background);
      stage.invalidate();
    },
    destroy() {
      [px, py, hover].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
