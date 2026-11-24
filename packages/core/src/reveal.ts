import { Mesh, Program, Texture, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex, revealFragment } from "./shaders";
import {
  animateTo,
  bindValue,
  createImageLoader,
  createStage,
  disposeResources,
  paintImage,
  supportsWebGL,
} from "./stage";

export interface ImageRevealOptions {
  /** Image shown at rest. Must be same origin or served with CORS headers. */
  src: string;
  /** Image revealed on hover. Must be same origin or served with CORS headers. */
  revealSrc: string;
}

export interface ImageRevealController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. The reveal spreads from here. */
  setPointer(x: number, y: number): void;
  /** Animate the reveal from 0 (first image) to 1 (second image). */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new source keeps showing the current image
   * until the new one has loaded.
   */
  update(options: ImageRevealOptions): void;
  destroy(): void;
}

export function createImageReveal(
  container: HTMLElement,
  options: ImageRevealOptions
): ImageRevealController {
  // Fallback: swap the plain images on hover.
  if (!supportsWebGL()) {
    let current = options;
    let revealed = false;
    const paint = () => paintImage(container, revealed ? current.revealSrc : current.src);
    paint();
    return {
      setPointer() {},
      setHover(value) {
        revealed = value > 0.5;
        paint();
      },
      update(next) {
        current = next;
        paint();
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
    onFrame(seconds) {
      program.uniforms.uTime.value = seconds;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  const textureA = new Texture(gl, { generateMipmaps: false });
  const textureB = new Texture(gl, { generateMipmaps: false });
  program = new Program(gl, {
    vertex: gradientVertex,
    fragment: revealFragment,
    uniforms: {
      uTexA: { value: textureA },
      uTexB: { value: textureB },
      uAspectA: { value: 1 },
      uAspectB: { value: 1 },
      uLoadedA: { value: 0 },
      uLoadedB: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uProgress: { value: 0 },
      uTime: { value: 0 },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const px = motionValue(0.5);
  const py = motionValue(0.5);
  const progress = motionValue(0);
  const loadedA = motionValue(0);
  bindValue(stage, px, (v) => (program.uniforms.uPointer.value[0] = v));
  bindValue(stage, py, (v) => (program.uniforms.uPointer.value[1] = v));
  bindValue(stage, progress, (v) => (program.uniforms.uProgress.value = v));
  bindValue(stage, loadedA, (v) => (program.uniforms.uLoadedA.value = v));

  const imagesA = createImageLoader((img) => {
    textureA.image = img;
    textureA.needsUpdate = true;
    program.uniforms.uAspectA.value = img.naturalWidth / img.naturalHeight;
    animateTo(stage, loadedA, 1, { duration: 0.6 });
    stage.invalidate();
  });
  // The second image only takes part once it has loaded, so the reveal never shows a blank.
  const imagesB = createImageLoader((img) => {
    textureB.image = img;
    textureB.needsUpdate = true;
    program.uniforms.uAspectB.value = img.naturalWidth / img.naturalHeight;
    program.uniforms.uLoadedB.value = 1;
    stage.invalidate();
  });
  imagesA.load(options.src);
  imagesB.load(options.revealSrc);

  stage.start();

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 120, damping: 20 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, progress, value, { duration: 0.9, ease: "easeInOut" });
    },
    update(next) {
      imagesA.load(next.src);
      imagesB.load(next.revealSrc);
      stage.invalidate();
    },
    destroy() {
      imagesA.cancel();
      imagesB.cancel();
      [px, py, progress, loadedA].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, texture: textureA, geometry });
      disposeResources(gl, { texture: textureB });
      stage.destroy();
    },
  };
}
