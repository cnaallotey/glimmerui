import { Mesh, Program, Texture, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex, tiltFragment } from "./shaders";
import {
  animateTo,
  bindValue,
  createImageLoader,
  createStage,
  disposeResources,
  paintImage,
  supportsWebGL,
} from "./stage";

export interface TiltCardOptions {
  /** Image URL. Must be same origin or served with CORS headers. */
  src: string;
  /** Maximum tilt in radians. Defaults to 0.4. */
  maxTilt?: number;
  /** Corner radius in CSS pixels. Defaults to 20. */
  radius?: number;
  /** Glare strength from 0 to 1. Defaults to 1. */
  glare?: number;
}

export interface TiltCardController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. The card tilts toward it. */
  setPointer(x: number, y: number): void;
  /** Animate hover amount from 0 to 1. Controls glare. */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new src keeps showing the current image
   * until the new one has loaded.
   */
  update(options: TiltCardOptions): void;
  destroy(): void;
}

export function createTiltCard(
  container: HTMLElement,
  options: TiltCardOptions
): TiltCardController {
  return createTiltEffect(container, options, tiltFragment);
}

export interface TiltEffectController<O> {
  setPointer(x: number, y: number): void;
  setHover(value: number): void;
  update(options: O): void;
  destroy(): void;
}

/**
 * The tilt card's engine: perspective, corners, glare and the image. Effects
 * built on it pass their own fragment (from tiltShader) and extra uniforms.
 */
export function createTiltEffect<O extends TiltCardOptions>(
  container: HTMLElement,
  options: O,
  fragment: string,
  extraUniforms: (options: O) => Record<string, unknown> = () => ({})
): TiltEffectController<O> {
  let maxTilt = options.maxTilt ?? 0.4;

  if (!supportsWebGL()) {
    const paint = (next: O) => {
      paintImage(container, next.src);
      container.style.borderRadius = `${next.radius ?? 20}px`;
    };
    paint(options);
    return {
      setPointer() {},
      setHover() {},
      update: paint,
      destroy() {
        container.style.background = "";
        container.style.borderRadius = "";
      },
    };
  }

  let program!: Program;
  let mesh!: Mesh;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame() {
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  const texture = new Texture(gl, { generateMipmaps: false });
  program = new Program(gl, {
    vertex: gradientVertex,
    fragment,
    uniforms: {
      uTex: { value: texture },
      uRes: { value: [1, 1] },
      uImgAspect: { value: 1 },
      uRot: { value: [0, 0] },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      // Leaves room so the near edge stays inside the canvas at full tilt.
      uInset: { value: 0.7 },
      uRadius: { value: options.radius ?? 20 },
      uGlare: { value: options.glare ?? 1 },
      uLoaded: { value: 0 },
      ...Object.fromEntries(
        Object.entries(extraUniforms(options)).map(([name, value]) => [name, { value }])
      ),
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const rx = motionValue(0);
  const ry = motionValue(0);
  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const hover = motionValue(0);
  const loaded = motionValue(0);
  bindValue(stage, rx, (v) => (program.uniforms.uRot.value[0] = v));
  bindValue(stage, ry, (v) => (program.uniforms.uRot.value[1] = v));
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, hover, (v) => (program.uniforms.uHover.value = v));
  bindValue(stage, loaded, (v) => (program.uniforms.uLoaded.value = v));

  const images = createImageLoader((img) => {
    texture.image = img;
    texture.needsUpdate = true;
    program.uniforms.uImgAspect.value = img.naturalWidth / img.naturalHeight;
    animateTo(stage, loaded, 1, { duration: 0.6 });
    stage.invalidate();
  });
  images.load(options.src);

  stage.start();

  const spring = { type: "spring", stiffness: 120, damping: 14 } as const;

  return {
    setPointer(x, y) {
      animateTo(stage, ry, (x - 0.5) * 2 * maxTilt, spring);
      animateTo(stage, rx, -(y - 0.5) * 2 * maxTilt, spring);
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { duration: 0.3 });
    },
    update(next) {
      maxTilt = next.maxTilt ?? 0.4;
      program.uniforms.uRadius.value = next.radius ?? 20;
      program.uniforms.uGlare.value = next.glare ?? 1;
      for (const [name, value] of Object.entries(extraUniforms(next))) {
        program.uniforms[name].value = value;
      }
      images.load(next.src);
      stage.invalidate();
    },
    destroy() {
      images.cancel();
      [rx, ry, px, py, hover, loaded].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, texture, geometry });
      stage.destroy();
    },
  };
}
