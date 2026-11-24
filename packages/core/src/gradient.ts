import { Color, Mesh, Program, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientFragment, gradientVertex } from "./shaders";
import {
  animateTo,
  bindValue,
  createStage,
  disposeResources,
  supportsWebGL,
} from "./stage";

export interface ShaderGradientOptions {
  /** Three CSS hex colors blended by the shader. */
  colors?: [string, string, string];
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
  /** Starting hover intensity from 0 to 1. */
  intensity?: number;
}

export interface ShaderGradientController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Smoothed with a spring. */
  setPointer(x: number, y: number): void;
  /** Animate the hover intensity to a value from 0 to 1. */
  setIntensity(value: number): void;
  /** Apply new options in place, without rebuilding the effect. */
  update(options: ShaderGradientOptions): void;
  destroy(): void;
}

const DEFAULT_COLORS: [string, string, string] = ["#3b1d8f", "#e0457b", "#f9b44c"];

export function createShaderGradient(
  container: HTMLElement,
  options: ShaderGradientOptions = {}
): ShaderGradientController {
  let colors = options.colors ?? DEFAULT_COLORS;
  let speed = options.speed ?? 1;
  let restIntensity = options.intensity ?? 0;

  // CSS fallback when WebGL is missing.
  if (!supportsWebGL()) {
    const paint = () => {
      container.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
    };
    paint();
    return {
      setPointer() {},
      setIntensity() {},
      update(next) {
        colors = next.colors ?? DEFAULT_COLORS;
        paint();
      },
      destroy() {
        container.style.background = "";
      },
    };
  }

  let program!: Program;
  let mesh!: Mesh;
  // Accumulated so a speed change keeps the animation phase instead of jumping.
  let phase = 0;
  let last: number | undefined;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame(seconds) {
      phase += (last === undefined ? seconds : seconds - last) * speed;
      last = seconds;
      program.uniforms.uTime.value = phase;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  program = new Program(gl, {
    vertex: gradientVertex,
    fragment: gradientFragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uIntensity: { value: restIntensity },
      uC1: { value: new Color(colors[0]) },
      uC2: { value: new Color(colors[1]) },
      uC3: { value: new Color(colors[2]) },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  // Motion values smooth the inputs, exactly like they would in a React tree.
  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const intensity = motionValue(restIntensity);
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, intensity, (v) => (program.uniforms.uIntensity.value = v));

  stage.start();

  const setIntensity = (value: number) =>
    animateTo(stage, intensity, value, { duration: 0.4 });

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 120, damping: 20 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setIntensity,
    update(next) {
      colors = next.colors ?? DEFAULT_COLORS;
      program.uniforms.uC1.value = new Color(colors[0]);
      program.uniforms.uC2.value = new Color(colors[1]);
      program.uniforms.uC3.value = new Color(colors[2]);
      speed = next.speed ?? 1;
      const nextIntensity = next.intensity ?? 0;
      if (nextIntensity !== restIntensity) {
        restIntensity = nextIntensity;
        setIntensity(nextIntensity);
      }
      stage.invalidate();
    },
    destroy() {
      px.destroy();
      py.destroy();
      intensity.destroy();
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
