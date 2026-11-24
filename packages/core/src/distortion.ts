import { Mesh, Program, Texture, Triangle } from "ogl";
import { motionValue } from "motion";
import { distortionFragment, gradientVertex } from "./shaders";
import {
  animateTo,
  bindValue,
  createImageLoader,
  createStage,
  disposeResources,
  paintImage,
  supportsWebGL,
} from "./stage";

export interface ImageDistortionOptions {
  /** Image URL. Must be same origin or served with CORS headers. */
  src: string;
  /** Ripple and color split strength. 1 is the default. */
  strength?: number;
}

export interface ImageDistortionController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Smoothed with a spring. */
  setPointer(x: number, y: number): void;
  /** Animate hover amount from 0 to 1. */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new src keeps showing the current image
   * until the new one has loaded.
   */
  update(options: ImageDistortionOptions): void;
  destroy(): void;
}

export function createImageDistortion(
  container: HTMLElement,
  options: ImageDistortionOptions
): ImageDistortionController {
  // Fallback: show the plain image.
  if (!supportsWebGL()) {
    const paint = (src: string) => {
      paintImage(container, src);
    };
    paint(options.src);
    return {
      setPointer() {},
      setHover() {},
      update(next) {
        paint(next.src);
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

  const texture = new Texture(gl, { generateMipmaps: false });
  program = new Program(gl, {
    vertex: gradientVertex,
    fragment: distortionFragment,
    uniforms: {
      uTex: { value: texture },
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uImgAspect: { value: 1 },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uStrength: { value: options.strength ?? 1 },
      uLoaded: { value: 0 },
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

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 140, damping: 18 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { type: "spring", stiffness: 90, damping: 14 });
    },
    update(next) {
      program.uniforms.uStrength.value = next.strength ?? 1;
      images.load(next.src);
      stage.invalidate();
    },
    destroy() {
      images.cancel();
      px.destroy();
      py.destroy();
      hover.destroy();
      loaded.destroy();
      disposeResources(gl, { program, texture, geometry });
      stage.destroy();
    },
  };
}
