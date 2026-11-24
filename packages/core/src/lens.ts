import { Mesh, Program, Texture, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex, lensFragment } from "./shaders";
import {
  animateTo,
  bindValue,
  createImageLoader,
  createStage,
  disposeResources,
  paintImage,
  supportsWebGL,
} from "./stage";

export interface LensImageOptions {
  /** Image URL. Must be same origin or served with CORS headers. */
  src: string;
  /** Magnification at the center of the lens. Defaults to 1.75. */
  zoom?: number;
  /** Lens radius in CSS pixels. Defaults to 96. */
  size?: number;
  /** Strength of the color fringing toward the rim, from 0 to 1. Defaults to 1. */
  fringe?: number;
}

export interface LensImageController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. The lens centers here. */
  setPointer(x: number, y: number): void;
  /** Animate the lens in (1) or out (0). */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new src keeps showing the current image
   * until the new one has loaded.
   */
  update(options: LensImageOptions): void;
  destroy(): void;
}

export function createLensImage(
  container: HTMLElement,
  options: LensImageOptions
): LensImageController {
  if (!supportsWebGL()) {
    paintImage(container, options.src);
    return {
      setPointer() {},
      setHover() {},
      update(next) {
        paintImage(container, next.src);
      },
      destroy() {
        container.style.background = "";
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
    fragment: lensFragment,
    uniforms: {
      uTex: { value: texture },
      uImgAspect: { value: 1 },
      uLoaded: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uZoom: { value: Math.max(1, options.zoom ?? 1.75) },
      uSize: { value: options.size ?? 96 },
      uFringe: { value: options.fringe ?? 1 },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const hover = motionValue(0);
  const loaded = motionValue(0);
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

  // Stiff enough that the lens stays under the pointer.
  const spring = { type: "spring", stiffness: 320, damping: 30 } as const;

  return {
    setPointer(x, y) {
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { type: "spring", stiffness: 200, damping: 22 });
    },
    update(next) {
      program.uniforms.uZoom.value = Math.max(1, next.zoom ?? 1.75);
      program.uniforms.uSize.value = next.size ?? 96;
      program.uniforms.uFringe.value = next.fringe ?? 1;
      images.load(next.src);
      stage.invalidate();
    },
    destroy() {
      images.cancel();
      [px, py, hover, loaded].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, texture, geometry });
      stage.destroy();
    },
  };
}
