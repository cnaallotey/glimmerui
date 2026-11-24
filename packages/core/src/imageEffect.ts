import { Mesh, Program, Texture, Triangle, type Renderer } from "ogl";
import { motionValue } from "motion";
import { gradientVertex } from "./shaders";
import {
  animateTo,
  bindValue,
  createImageLoader,
  createStage,
  disposeResources,
  paintImage,
  supportsWebGL,
  type Transition,
} from "./stage";

/** Options every image effect takes. */
export interface ImageEffectBaseOptions {
  /** Image URL. Must be same origin or served with CORS headers. */
  src: string;
}

/**
 * Describes a shader effect on one image. The shader gets these uniforms for
 * free: uTex (the image), uImgAspect (its width over height), uLoaded (0 to 1,
 * fades in once the image loads), uTime (seconds), uRes (CSS pixels), uPointer
 * (0 to 1, origin at the bottom left) and uHover (0 to 1). Include coverChunk
 * from shaders.ts to crop the image like object-fit: cover.
 */
export interface ImageEffectSpec<O extends ImageEffectBaseOptions, R> {
  fragment: string;
  /** Fill in defaults and clamp ranges. */
  resolve(options: O): R;
  /** Uniform values for these options. Called on create and on every update. */
  uniforms(resolved: R): Record<string, unknown>;
  /**
   * Create extra GPU resources once, such as a texture of glyphs, and return
   * them as uniforms. Textures returned here are freed with the effect.
   */
  setup?(gl: Renderer["gl"], resolved: R): Record<string, unknown>;
  pointerSpring?: Transition;
  hoverTransition?: Transition;
}

export interface ImageEffectController<O> {
  /** Pointer position in 0 to 1 space, origin at the bottom left. */
  setPointer(x: number, y: number): void;
  /** Animate the effect's hover state from 0 to 1. */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new src keeps showing the current image
   * until the new one has loaded.
   */
  update(options: O): void;
  destroy(): void;
}

export function createImageEffect<O extends ImageEffectBaseOptions, R>(
  container: HTMLElement,
  options: O,
  spec: ImageEffectSpec<O, R>
): ImageEffectController<O> {
  // Fallback: the plain image, covering the element.
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
    onFrame(seconds) {
      program.uniforms.uTime.value = seconds;
      stage.renderer.render({ scene: mesh });
    },
  });
  const gl = stage.gl;

  const texture = new Texture(gl, { generateMipmaps: false });
  const uniforms: Record<string, { value: unknown }> = {
    uTex: { value: texture },
    uImgAspect: { value: 1 },
    uLoaded: { value: 0 },
    uTime: { value: 0 },
    uRes: { value: [1, 1] },
    uPointer: { value: [0.5, 0.5] },
    uHover: { value: 0 },
  };
  const resolved = spec.resolve(options);
  const extras = spec.setup ? spec.setup(gl, resolved) : {};
  for (const [name, value] of Object.entries({ ...extras, ...spec.uniforms(resolved) })) {
    uniforms[name] = { value };
  }
  program = new Program(gl, { vertex: gradientVertex, fragment: spec.fragment, uniforms });
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

  const pointerSpring = spec.pointerSpring ?? { type: "spring", stiffness: 200, damping: 26 };
  const hoverTransition = spec.hoverTransition ?? { duration: 0.45, ease: "easeOut" };

  return {
    setPointer(x, y) {
      animateTo(stage, px, x, pointerSpring);
      animateTo(stage, py, y, pointerSpring);
    },
    setHover(value) {
      animateTo(stage, hover, value, hoverTransition);
    },
    update(next) {
      for (const [name, value] of Object.entries(spec.uniforms(spec.resolve(next)))) {
        program.uniforms[name].value = value;
      }
      images.load(next.src);
      stage.invalidate();
    },
    destroy() {
      images.cancel();
      [px, py, hover, loaded].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, texture, geometry });
      for (const value of Object.values(extras)) {
        if (value instanceof Texture) disposeResources(gl, { texture: value });
      }
      stage.destroy();
    },
  };
}
