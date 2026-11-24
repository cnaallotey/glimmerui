import { Color, Geometry, Mesh, Program } from "ogl";
import { motionValue } from "motion";
import { particleFragment, particleVertex } from "./shaders";
import { animateTo, bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

export interface ParticlesOptions {
  /** Number of particles, from 1 to 20000. */
  count?: number;
  /** Particle color, as a hex value. */
  color?: string;
  /** Color particles take on near the pointer, as a hex value. */
  accent?: string;
  /** Average particle diameter, in CSS pixels. */
  size?: number;
  /** How far the pointer's pull reaches, in CSS pixels. */
  radius?: number;
  /** Time multiplier for the drift. 1 is the default speed. */
  speed?: number;
}

export interface ParticlesController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Particles gather here. */
  setPointer(x: number, y: number): void;
  /** Animate the pointer's pull from 0 to 1. */
  setHover(value: number): void;
  /** Apply new options in place. Changing count rebuilds only the particle positions. */
  update(options: ParticlesOptions): void;
  destroy(): void;
}

const DEFAULTS = { count: 2500, color: "#8b8a94", accent: "#e0457b", size: 2, radius: 160, speed: 1 };

function resolve(o: ParticlesOptions) {
  return {
    count: Math.min(20000, Math.max(1, Math.round(o.count ?? DEFAULTS.count))),
    color: o.color ?? DEFAULTS.color,
    accent: o.accent ?? DEFAULTS.accent,
    size: o.size ?? DEFAULTS.size,
    radius: Math.max(1, o.radius ?? DEFAULTS.radius),
    speed: o.speed ?? DEFAULTS.speed,
  };
}

function seeds(count: number) {
  const data = new Float32Array(count * 3);
  for (let i = 0; i < data.length; i++) data[i] = Math.random();
  return data;
}

export function createParticles(
  container: HTMLElement,
  options: ParticlesOptions = {}
): ParticlesController {
  // CSS fallback: a sparse scatter of dots in the particle color.
  if (!supportsWebGL()) {
    const paint = (next: ParticlesOptions) => {
      const o = resolve(next);
      container.style.backgroundImage = [
        `radial-gradient(circle at 20% 30%, ${o.color} 1px, transparent 1.5px)`,
        `radial-gradient(circle at 70% 60%, ${o.color} 1px, transparent 1.5px)`,
      ].join(", ");
      container.style.backgroundSize = "37px 41px, 53px 47px";
    };
    paint(options);
    return {
      setPointer() {},
      setHover() {},
      update: paint,
      destroy() {
        container.style.backgroundImage = "";
        container.style.backgroundSize = "";
      },
    };
  }

  let o = resolve(options);
  let program!: Program;
  let mesh!: Mesh;
  let phase = 0;
  let last: number | undefined;

  const stage = createStage(container, {
    onResize(w, h, scale) {
      program.uniforms.uRes.value = [w, h];
      program.uniforms.uScale.value = scale;
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
    vertex: particleVertex,
    fragment: particleFragment,
    transparent: true,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uScale: { value: 1 },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uSize: { value: o.size },
      uRadius: { value: o.radius },
      uColor: { value: new Color(o.color) },
      uAccent: { value: new Color(o.accent) },
    },
  });
  // Points overlap, so blend them, keeping the canvas alpha correct for the copy.
  program.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const makeGeometry = (count: number) =>
    new Geometry(gl, { seed: { size: 3, data: seeds(count) } });
  let geometry = makeGeometry(o.count);
  let builtCount = o.count;
  mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const hover = motionValue(0);
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, hover, (v) => (program.uniforms.uHover.value = v));

  stage.start();

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 90, damping: 18 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { type: "spring", stiffness: 60, damping: 14 });
    },
    update(next) {
      o = resolve(next);
      program.uniforms.uSize.value = o.size;
      program.uniforms.uRadius.value = o.radius;
      program.uniforms.uColor.value = new Color(o.color);
      program.uniforms.uAccent.value = new Color(o.accent);
      if (o.count !== builtCount) {
        disposeResources(gl, { geometry });
        geometry = makeGeometry(o.count);
        builtCount = o.count;
        mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });
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
