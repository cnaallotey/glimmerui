import { Color, Mesh, Program, Triangle } from "ogl";
import { motionValue } from "motion";
import { auroraFragment, gradientVertex } from "./shaders";
import { animateTo, bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

export interface AuroraOptions {
  /** Three hex colors, one for each curtain of light. */
  colors?: [string, string, string];
  /** Sky color behind the light, as a hex value. */
  background?: string;
  /** Time multiplier. 1 is the default speed. */
  speed?: number;
  /** How strongly the pointer pulls the light before the first hover, from 0 to 1. */
  intensity?: number;
}

export interface AuroraController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Smoothed with a spring. */
  setPointer(x: number, y: number): void;
  /** Animate the pointer's pull to a value from 0 to 1. */
  setIntensity(value: number): void;
  /** Apply new options in place, without rebuilding the effect. */
  update(options: AuroraOptions): void;
  destroy(): void;
}

const DEFAULT_COLORS: [string, string, string] = ["#2dd4bf", "#a3e635", "#a855f7"];
const DEFAULT_BACKGROUND = "#0b1026";

export function createAurora(
  container: HTMLElement,
  options: AuroraOptions = {}
): AuroraController {
  let colors = options.colors ?? DEFAULT_COLORS;
  let background = options.background ?? DEFAULT_BACKGROUND;
  let speed = options.speed ?? 1;
  let restIntensity = options.intensity ?? 0;

  // CSS fallback: soft glows of the three colors over the sky color.
  if (!supportsWebGL()) {
    const paint = () => {
      container.style.background = [
        `radial-gradient(ellipse 70% 40% at 30% 55%, color-mix(in srgb, ${colors[0]} 40%, transparent), transparent)`,
        `radial-gradient(ellipse 60% 35% at 65% 42%, color-mix(in srgb, ${colors[1]} 30%, transparent), transparent)`,
        `radial-gradient(ellipse 50% 30% at 50% 30%, color-mix(in srgb, ${colors[2]} 25%, transparent), transparent)`,
        background,
      ].join(", ");
    };
    paint();
    return {
      setPointer() {},
      setIntensity() {},
      update(next) {
        colors = next.colors ?? DEFAULT_COLORS;
        background = next.background ?? DEFAULT_BACKGROUND;
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
    fragment: auroraFragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uIntensity: { value: restIntensity },
      uC1: { value: new Color(colors[0]) },
      uC2: { value: new Color(colors[1]) },
      uC3: { value: new Color(colors[2]) },
      uBg: { value: new Color(background) },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const intensity = motionValue(restIntensity);
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, intensity, (v) => (program.uniforms.uIntensity.value = v));

  stage.start();

  const setIntensity = (value: number) =>
    animateTo(stage, intensity, value, { duration: 0.6 });

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 80, damping: 20 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setIntensity,
    update(next) {
      colors = next.colors ?? DEFAULT_COLORS;
      background = next.background ?? DEFAULT_BACKGROUND;
      program.uniforms.uC1.value = new Color(colors[0]);
      program.uniforms.uC2.value = new Color(colors[1]);
      program.uniforms.uC3.value = new Color(colors[2]);
      program.uniforms.uBg.value = new Color(background);
      speed = next.speed ?? 1;
      const nextIntensity = next.intensity ?? 0;
      if (nextIntensity !== restIntensity) {
        restIntensity = nextIntensity;
        setIntensity(nextIntensity);
      }
      stage.invalidate();
    },
    destroy() {
      [px, py, intensity].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
