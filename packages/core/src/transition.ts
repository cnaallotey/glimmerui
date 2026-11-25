import { Mesh, Program, Triangle } from "ogl";
import { animate, motionValue } from "motion";
import { createMediaFallback, createMediaTexture, type MediaOptions, type MediaTexture } from "./media";
import { playProgress, trackScroll } from "./scroll";
import { coverChunk, gradientVertex, noiseChunk } from "./shaders";
import { bindValue, createStage, disposeResources, supportsWebGL } from "./stage";

/** How ImageTransition gets from one image to the next. */
export type TransitionEffect = "dissolve" | "wipe" | "blocks" | "ripple" | "zoom";

const EFFECTS: TransitionEffect[] = ["dissolve", "wipe", "blocks", "ripple", "zoom"];

export interface ImageTransitionOptions extends MediaOptions {
  /** Image or video URLs. Each must be same origin or served with CORS headers. */
  images: string[];
  /** Which image shows. Changing it plays the transition. Defaults to 0. */
  index?: number;
  /** The transition to play. Defaults to "dissolve". */
  effect?: TransitionEffect;
  /** Length of a transition in seconds. Defaults to 1.2. */
  duration?: number;
  /** Move through the images as the element scrolls through the screen, instead of by index. */
  scroll?: boolean;
  /**
   * Set the position yourself: 0 is the first image, 1 the second, and 0.5
   * halfway between them. Replaces both index and scroll.
   */
  progress?: number;
}

/** An image or video and its accessible description, as the components take them. */
export interface TransitionImage {
  src: string;
  alt: string;
}

/**
 * The accessible label for a set of images: the one on show or, while the
 * scroll is in charge, all of them.
 */
export function transitionLabel(
  images: TransitionImage[],
  options: Pick<ImageTransitionOptions, "index" | "scroll" | "progress">
): string {
  if (options.scroll && options.progress === undefined) {
    return images.map((image) => image.alt).filter(Boolean).join(", ");
  }
  const at = Math.round(options.progress ?? options.index ?? 0);
  return images[Math.min(images.length - 1, Math.max(0, at))]?.alt ?? "";
}

export interface ImageTransitionController {
  /** Pointer position in 0 to 1 space, origin at the bottom left. Not used by this effect. */
  setPointer(x: number, y: number): void;
  /** Not used by this effect. */
  setHover(value: number): void;
  /**
   * Apply new options in place. A new index plays the transition. One that
   * arrives during a transition plays next.
   */
  update(options: ImageTransitionOptions): void;
  destroy(): void;
}

// Every effect works out m, how far each pixel has changed from image A to image
// B, plus an offset that bends both images near the change. uDir is 1 going
// forward and -1 going back, so a transition plays in reverse on the way back.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uAspectA;
uniform float uAspectB;
uniform float uLoadedA;
uniform float uLoadedB;
uniform vec2 uRes;
uniform float uMix;
uniform float uDir;
uniform float uEffect;
varying vec2 vUv;
${noiseChunk}
${coverChunk}
float ca;
vec3 imageA(vec2 uv) {
  return mix(vec3(0.04, 0.04, 0.06), texture2D(uTexA, coverUv(uv, ca, uAspectA)).rgb, uLoadedA);
}
vec3 imageB(vec2 uv) {
  return texture2D(uTexB, coverUv(uv, ca, uAspectB)).rgb;
}
// Runs from 0 to 1 across a soft band as t goes from 0 to 1. where is 0 for the
// pixels that change first and 1 for the last.
float sweep(float where, float t, float soft) {
  float edge = mix(-soft, 1.0, t);
  return 1.0 - smoothstep(edge, edge + soft, where);
}
void main() {
  ca = uRes.x / uRes.y;
  float t = clamp(uMix, 0.0, 1.0);
  vec2 p = vUv * vec2(ca, 1.0);
  vec3 a;
  vec3 b;
  float m;
  float glow = 0.0;

  if (uEffect < 0.5) {
    // Dissolve: a noisy edge eats through the image.
    float n = clamp(fbm(p * 3.2) * 1.15 - 0.06, 0.0, 1.0);
    m = sweep(n, t, 0.12);
    float band = m * (1.0 - m) * 4.0;
    vec2 off = (vec2(noise(p * 6.0), noise(p * 6.0 + 9.0)) - 0.5) * band * 0.08;
    a = imageA(vUv + off);
    b = imageB(vUv - off);
    glow = band * 0.1;
  } else if (uEffect < 1.5) {
    // Wipe: a slightly wavy vertical edge that bends the images like a lens.
    float x = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
    float wave = (noise(vec2(vUv.y * 4.0, 2.0)) - 0.5) * 0.14 * sin(t * 3.14159);
    m = sweep(clamp(x + wave, 0.0, 1.0), t, 0.16);
    float band = m * (1.0 - m) * 4.0;
    vec2 off = vec2(uDir * band * 0.08, 0.0);
    a = imageA(vUv + off);
    b = imageB(vUv - off);
    glow = band * 0.12;
  } else if (uEffect < 2.5) {
    // Blocks: square tiles swap one by one, in a loose diagonal sweep.
    vec2 count = vec2(floor(12.0 * max(ca, 1.0)), floor(12.0 * max(1.0 / ca, 1.0)));
    vec2 tile = floor(vUv * count);
    vec2 at = (tile + 0.5) / count;
    float diagonal = uDir > 0.0 ? at.x * 0.5 + (1.0 - at.y) * 0.5 : 1.0 - (at.x * 0.5 + (1.0 - at.y) * 0.5);
    float local = sweep(mix(diagonal, hash(gridPoint(tile)), 0.45), t, 0.28);
    // Each tile shrinks to its center and grows back as the other image.
    vec2 f = abs(fract(vUv * count) - 0.5) * 2.0;
    float size = local < 0.5 ? 1.0 : local * 2.0 - 1.0;
    float inside = step(max(f.x, f.y), size);
    m = local < 0.5 ? 0.0 : inside;
    float lift = 1.0 - abs(local * 2.0 - 1.0);
    vec2 pull = (at - vUv) * lift * 0.35;
    a = imageA(vUv + pull);
    b = imageB(vUv + pull);
    glow = lift * 0.06;
  } else if (uEffect < 3.5) {
    // Ripple: a ring spreads from the center and leaves the other image behind.
    vec2 d = (vUv - 0.5) * vec2(ca, 1.0);
    float far = length(vec2(ca, 1.0)) * 0.5;
    float r = length(d) / far;
    m = sweep(r, t, 0.22);
    float band = m * (1.0 - m) * 4.0;
    vec2 dir = d / max(length(d), 0.0001) / vec2(ca, 1.0);
    vec2 off = dir * sin(r * 26.0 - t * 14.0) * band * 0.035;
    a = imageA(vUv + off);
    b = imageB(vUv + off);
    glow = band * 0.08;
  } else {
    // Zoom: both images rush past with a radial blur while they cross over.
    float rush = sin(t * 3.14159);
    vec2 d = vUv - 0.5;
    float za = 1.0 - t * 0.35 * uDir;
    float zb = 1.0 + (1.0 - t) * 0.35 * uDir;
    a = vec3(0.0);
    b = vec3(0.0);
    float jitter = hash(vUv * uRes) - 0.5;
    for (int i = 0; i < 9; i++) {
      float k = 1.0 - rush * 0.16 * (float(i) + jitter) / 8.0;
      a += imageA(0.5 + d * za * k);
      b += imageB(0.5 + d * zb * k);
    }
    a /= 9.0;
    b /= 9.0;
    m = smoothstep(0.25, 0.75, t);
  }

  m *= uLoadedB;
  gl_FragColor = vec4(mix(a, b, m) + glow * uLoadedB, 1.0);
}
`;

interface Slide {
  src: string;
  media: MediaTexture;
  aspect: number;
  loaded: number;
}

export function createImageTransition(
  container: HTMLElement,
  options: ImageTransitionOptions
): ImageTransitionController {
  let current = options;
  let stopScroll: (() => void) | undefined;
  let scrolled = 0;

  const last = () => Math.max(0, current.images.length - 1);
  const clampIndex = (i: number) => Math.min(last(), Math.max(0, Math.round(i)));
  /** The position that progress or scroll asks for, or undefined when index is in charge. */
  const position = () =>
    current.progress !== undefined
      ? Math.min(last(), Math.max(0, current.progress))
      : current.scroll
        ? scrolled * last()
        : undefined;
  const followScroll = (apply: () => void) => {
    const wanted = !!current.scroll && current.progress === undefined;
    if (wanted === !!stopScroll) return;
    if (stopScroll) {
      stopScroll();
      stopScroll = undefined;
    } else {
      stopScroll = trackScroll(container, (p) => {
        scrolled = playProgress(p);
        apply();
      });
    }
  };

  // Fallback: the plain image, swapped without a transition.
  if (!supportsWebGL()) {
    const fallback = createMediaFallback(container);
    const paint = () => {
      const src = current.images[clampIndex(position() ?? current.index ?? 0)];
      if (src !== undefined) fallback.show(src, current);
    };
    const apply = () => {
      followScroll(paint);
      paint();
    };
    apply();
    return {
      setPointer() {},
      setHover() {},
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
  let slides: Slide[] = [];
  let from = clampIndex(options.index ?? 0);
  let to = from;
  let active = true;

  const stage = createStage(container, {
    onResize(w, h) {
      program.uniforms.uRes.value = [w, h];
    },
    onFrame() {
      const a = slides[from];
      const b = slides[to] ?? a;
      if (!a) return;
      a.media.update();
      if (b !== a) b.media.update();
      const u = program.uniforms;
      u.uTexA.value = a.media.texture;
      u.uTexB.value = b.media.texture;
      u.uAspectA.value = a.aspect;
      u.uAspectB.value = b.aspect;
      u.uLoadedA.value = a.loaded;
      u.uLoadedB.value = b.loaded;
      stage.renderer.render({ scene: mesh });
    },
    onActive(next) {
      active = next;
      playVisible();
    },
  });
  const gl = stage.gl;

  program = new Program(gl, {
    vertex: gradientVertex,
    fragment,
    uniforms: {
      uTexA: { value: null },
      uTexB: { value: null },
      uAspectA: { value: 1 },
      uAspectB: { value: 1 },
      uLoadedA: { value: 0 },
      uLoadedB: { value: 0 },
      uRes: { value: [1, 1] },
      uMix: { value: 0 },
      uDir: { value: 1 },
      uEffect: { value: 0 },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });

  const mix = motionValue(0);
  bindValue(stage, mix, (v) => (program.uniforms.uMix.value = v));

  /** Only the videos on show play. */
  function playVisible() {
    slides.forEach((slide, i) => slide.media.setActive(active && (i === from || i === to)));
  }

  function show(a: number, b: number, amount: number) {
    const moved = a !== from || b !== to;
    from = a;
    to = b;
    mix.set(amount);
    if (moved) playVisible();
    stage.invalidate();
  }

  function createSlide(src: string): Slide {
    const slide: Slide = { src, media: undefined!, aspect: 1, loaded: 0 };
    let first = true;
    slide.media = createMediaTexture(stage, (aspect) => {
      slide.aspect = aspect;
      if (!first) return;
      first = false;
      // Fade in the first time, so a late image doesn't pop.
      if (stage.reduceMotion) slide.loaded = 1;
      else fades.push(animate(0, 1, { duration: 0.6, onUpdate: (v) => (slide.loaded = v) }));
    });
    return slide;
  }
  const fades: { stop(): void }[] = [];

  function freeSlide(slide: Slide) {
    slide.media.destroy();
    disposeResources(gl, { texture: slide.media.texture });
  }

  /** Keeps the slides whose source is still in the list. */
  function syncSlides() {
    const spare = [...slides];
    slides = current.images.map((src) => {
      const i = spare.findIndex((slide) => slide.src === src);
      return i >= 0 ? spare.splice(i, 1)[0] : createSlide(src);
    });
    spare.forEach(freeSlide);
    slides.forEach((slide) => slide.media.load(slide.src, current));
    from = clampIndex(from);
    to = clampIndex(to);
    playVisible();
  }

  // Index changes play one transition at a time. The latest request wins.
  let playing: { stop(): void } | undefined;
  function stopPlaying() {
    playing?.stop();
    playing = undefined;
  }
  function play() {
    if (playing) return;
    const target = clampIndex(current.index ?? 0);
    // At rest the shown image is always from.
    if (target === from) return;
    if (stage.reduceMotion) {
      show(target, target, 0);
      return;
    }
    program.uniforms.uDir.value = target > from ? 1 : -1;
    show(from, target, 0);
    playing = animate(mix, 1, {
      duration: Math.max(0, current.duration ?? 1.2),
      ease: "easeInOut",
      onComplete() {
        playing = undefined;
        show(to, to, 0);
        play();
      },
    });
  }

  /** Moves to wherever the index, scroll or progress points. */
  function place() {
    const at = position();
    if (at === undefined) {
      // Back from scroll or progress: settle on the nearest image first.
      if (!playing && from !== to) show(clampIndex(from + mix.get()), clampIndex(from + mix.get()), 0);
      play();
    } else {
      stopPlaying();
      program.uniforms.uDir.value = 1;
      const a = Math.min(Math.floor(at), Math.max(0, last() - 1));
      show(a, Math.min(last(), a + 1), at - a);
    }
    stage.invalidate();
  }

  function apply() {
    program.uniforms.uEffect.value = Math.max(0, EFFECTS.indexOf(current.effect ?? "dissolve"));
    followScroll(place);
    place();
  }

  syncSlides();
  stage.start();
  apply();

  return {
    setPointer() {},
    setHover() {},
    update(next) {
      current = next;
      syncSlides();
      apply();
    },
    destroy() {
      stopScroll?.();
      stopPlaying();
      fades.forEach((fade) => fade.stop());
      mix.destroy();
      slides.forEach(freeSlide);
      disposeResources(gl, { program, geometry });
      stage.destroy();
    },
  };
}
