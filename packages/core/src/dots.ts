import { Color, Mesh, Program, Triangle } from "ogl";
import { motionValue } from "motion";
import { dotGridFragment, gradientVertex } from "./shaders";
import { animateTo, bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

export interface DotGridOptions {
  /** Dot color, as a hex value. */
  color?: string;
  /** Color the dots take on near the pointer, as a hex value. */
  accent?: string;
  /** Distance between dot centers, in CSS pixels. */
  spacing?: number;
  /** Dot radius, in CSS pixels. */
  size?: number;
  /** How far the pointer's influence reaches, in CSS pixels. */
  radius?: number;
}

export interface DotGridController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Smoothed with a spring. */
  setPointer(x: number, y: number): void;
  /** Animate the pointer's influence from 0 to 1. */
  setHover(value: number): void;
  /** Apply new options in place, without rebuilding the effect. */
  update(options: DotGridOptions): void;
  destroy(): void;
}

const DEFAULTS = {
  color: "#8f8bab",
  accent: "#e0457b",
  spacing: 24,
  size: 1.5,
  radius: 140,
};

function resolve(options: DotGridOptions) {
  return {
    color: options.color ?? DEFAULTS.color,
    accent: options.accent ?? DEFAULTS.accent,
    spacing: Math.max(2, options.spacing ?? DEFAULTS.spacing),
    size: options.size ?? DEFAULTS.size,
    radius: Math.max(1, options.radius ?? DEFAULTS.radius),
  };
}

export function createDotGrid(
  container: HTMLElement,
  options: DotGridOptions = {}
): DotGridController {
  // CSS fallback: the same grid of dots, without the pointer.
  if (!supportsWebGL()) {
    const paint = (next: DotGridOptions) => {
      const o = resolve(next);
      container.style.backgroundImage = `radial-gradient(circle, ${o.color} ${o.size}px, transparent ${o.size + 0.75}px)`;
      container.style.backgroundSize = `${o.spacing}px ${o.spacing}px`;
      container.style.backgroundPosition = "center";
    };
    paint(options);
    return {
      setPointer() {},
      setHover() {},
      update: paint,
      destroy() {
        container.style.backgroundImage = "";
        container.style.backgroundSize = "";
        container.style.backgroundPosition = "";
      },
    };
  }

  let program!: Program;
  let mesh!: Mesh;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame(seconds) {
      program.uniforms.uTime.value = seconds;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  const o = resolve(options);
  program = new Program(gl, {
    vertex: gradientVertex,
    fragment: dotGridFragment,
    uniforms: {
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new Color(o.color) },
      uAccent: { value: new Color(o.accent) },
      uSpacing: { value: o.spacing },
      uSize: { value: o.size },
      uRadius: { value: o.radius },
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
      const spring = { type: "spring", stiffness: 150, damping: 20 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { duration: 0.35 });
    },
    update(next) {
      const r = resolve(next);
      program.uniforms.uColor.value = new Color(r.color);
      program.uniforms.uAccent.value = new Color(r.accent);
      program.uniforms.uSpacing.value = r.spacing;
      program.uniforms.uSize.value = r.size;
      program.uniforms.uRadius.value = r.radius;
      stage.invalidate();
    },
    destroy() {
      [px, py, hover].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
