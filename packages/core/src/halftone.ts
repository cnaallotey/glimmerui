import { Color, Mesh, Program, Texture, Triangle } from "ogl";
import { motionValue } from "motion";
import { gradientVertex, halftoneFragment } from "./shaders";
import {
  animateTo,
  bindValue,
  createImageLoader,
  createStage,
  disposeResources,
  paintImage,
  supportsWebGL,
} from "./stage";

export interface HalftoneImageOptions {
  /** Image URL. Must be same origin or served with CORS headers. */
  src: string;
  /** Distance between dot centers, in CSS pixels. Defaults to 8. */
  cell?: number;
  /** Dot color, as a hex value. Defaults to near-black. */
  ink?: string;
  /** Paper color behind the dots, as a hex value. Defaults to off-white. */
  paper?: string;
  /** Radius of the full-color area around the pointer, in CSS pixels. Defaults to 140. */
  radius?: number;
}

export interface HalftoneImageController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. */
  setPointer(x: number, y: number): void;
  /** Animate the full-color area in (1) or out (0). */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new src keeps showing the current image
   * until the new one has loaded.
   */
  update(options: HalftoneImageOptions): void;
  destroy(): void;
}

const DEFAULTS = { cell: 8, ink: "#0e0d12", paper: "#fafafa", radius: 140 };

export function createHalftoneImage(
  container: HTMLElement,
  options: HalftoneImageOptions
): HalftoneImageController {
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
    fragment: halftoneFragment,
    uniforms: {
      uTex: { value: texture },
      uImgAspect: { value: 1 },
      uLoaded: { value: 0 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uCell: { value: Math.max(2, options.cell ?? DEFAULTS.cell) },
      uRadius: { value: options.radius ?? DEFAULTS.radius },
      uInk: { value: new Color(options.ink ?? DEFAULTS.ink) },
      uPaper: { value: new Color(options.paper ?? DEFAULTS.paper) },
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
      const spring = { type: "spring", stiffness: 200, damping: 26 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      animateTo(stage, hover, value, { duration: 0.45, ease: "easeOut" });
    },
    update(next) {
      program.uniforms.uCell.value = Math.max(2, next.cell ?? DEFAULTS.cell);
      program.uniforms.uRadius.value = next.radius ?? DEFAULTS.radius;
      program.uniforms.uInk.value = new Color(next.ink ?? DEFAULTS.ink);
      program.uniforms.uPaper.value = new Color(next.paper ?? DEFAULTS.paper);
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
