import { Mesh, Program, Triangle } from "ogl";
import { motionValue } from "motion";
import { createMediaFallback, createMediaTexture, type MediaOptions, type MediaTexture } from "./media";
import { playProgress, trackScroll } from "./scroll";
import { gradientVertex, revealFragment } from "./shaders";
import { animateTo, bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

export interface ImageRevealOptions extends MediaOptions {
  /** Image or video shown at rest. Must be same origin or served with CORS headers. */
  src: string;
  /** Image or video that gets revealed. Must be same origin or served with CORS headers. */
  revealSrc: string;
  /** Reveal as the element scrolls through the screen, instead of on hover. */
  scroll?: boolean;
  /** Set the reveal yourself, from 0 to 1. Replaces both hover and scroll. */
  progress?: number;
}

export interface ImageRevealController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. The reveal spreads from here. */
  setPointer(x: number, y: number): void;
  /**
   * Animate the reveal from 0 (first image) to 1 (second image). Ignored while
   * scroll or progress drives it.
   */
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
  let current = options;
  let hovered = 0;
  let stopScroll: (() => void) | undefined;

  /** Starts or stops following the scroll, to match the options. */
  const followScroll = (apply: (progress: number) => void) => {
    const wanted = !!current.scroll && current.progress === undefined;
    if (wanted === !!stopScroll) return;
    if (stopScroll) {
      stopScroll();
      stopScroll = undefined;
    } else {
      stopScroll = trackScroll(container, (p) => apply(playProgress(p)));
    }
  };
  const clamp = (v: number) => Math.min(1, Math.max(0, v));

  // Fallback: swap between the plain images.
  if (!supportsWebGL()) {
    const fallback = createMediaFallback(container);
    let amount = 0;
    const paint = () => fallback.show(amount > 0.5 ? current.revealSrc : current.src, current);
    const set = (value: number) => {
      amount = value;
      paint();
    };
    const apply = () => {
      followScroll(set);
      if (current.progress !== undefined) set(clamp(current.progress));
      else if (current.scroll) paint();
      else set(hovered);
    };
    apply();
    return {
      setPointer() {},
      setHover(value) {
        hovered = value;
        apply();
      },
      update(next) {
        current = next;
        apply();
      },
      destroy() {
        stopScroll?.();
        fallback.destroy();
      },
    };
  }

  let program!: Program;
  let mesh!: Mesh;
  let mediaA!: MediaTexture;
  let mediaB!: MediaTexture;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame(seconds) {
      mediaA.update();
      mediaB.update();
      program.uniforms.uTime.value = seconds;
      stage.renderer.render({ scene: mesh });
    },
    onActive(active) {
      mediaA.setActive(active);
      mediaB.setActive(active);
    },
  });
  const gl = stage.gl;

  mediaA = createMediaTexture(stage, (aspect) => {
    program.uniforms.uAspectA.value = aspect;
    animateTo(stage, loadedA, 1, { duration: 0.6 });
  });
  // The second image only takes part once it has loaded, so the reveal never shows a blank.
  mediaB = createMediaTexture(stage, (aspect) => {
    program.uniforms.uAspectB.value = aspect;
    program.uniforms.uLoadedB.value = 1;
  });
  program = new Program(gl, {
    vertex: gradientVertex,
    fragment: revealFragment,
    uniforms: {
      uTexA: { value: mediaA.texture },
      uTexB: { value: mediaB.texture },
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

  const load = () => {
    mediaA.load(current.src, current);
    mediaB.load(current.revealSrc, current);
  };
  load();

  stage.start();

  // Follows its driver directly: progress and scroll already move smoothly.
  const set = (value: number) => {
    progress.stop();
    progress.set(value);
  };
  const apply = () => {
    followScroll(set);
    if (current.progress !== undefined) set(clamp(current.progress));
    else if (!current.scroll) animateTo(stage, progress, hovered, { duration: 0.9, ease: "easeInOut" });
  };
  apply();

  return {
    setPointer(x, y) {
      const spring = { type: "spring", stiffness: 120, damping: 20 } as const;
      animateTo(stage, px, x, spring);
      animateTo(stage, py, y, spring);
    },
    setHover(value) {
      hovered = value;
      if (current.progress === undefined && !current.scroll) apply();
    },
    update(next) {
      current = next;
      load();
      apply();
      stage.invalidate();
    },
    destroy() {
      stopScroll?.();
      mediaA.destroy();
      mediaB.destroy();
      [px, py, progress, loadedA].forEach((mv) => mv.destroy());
      disposeResources(gl, { program, texture: mediaA.texture, geometry });
      disposeResources(gl, { texture: mediaB.texture });
      stage.destroy();
    },
  };
}
