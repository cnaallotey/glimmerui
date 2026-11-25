import { Renderer } from "ogl";
import { animate, cancelFrame, frame, type MotionValue } from "motion";

let webglSupported: boolean | undefined;

export function supportsWebGL(): boolean {
  if (webglSupported === undefined) {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as
        | WebGLRenderingContext
        | null;
      webglSupported = !!gl;
      // Release the probe right away so it does not hold one of the page's few context slots.
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupported = false;
    }
  }
  return webglSupported;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia(REDUCED_MOTION).matches;
}

/** Largest side, in device pixels, that any single effect renders at. */
const MAX_SIDE = 4096;

/**
 * How long the shared context outlives its last effect. Covers React StrictMode
 * and route changes, where one effect unmounts just before the next one mounts.
 */
const TEARDOWN_DELAY = 1000;

interface Shared {
  renderer: Renderer;
  gl: Renderer["gl"];
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

interface Entry {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  devW: number;
  devH: number;
  visible: boolean;
  reduceMotion: boolean;
  ready: boolean;
  paused: boolean;
  onFrame(seconds: number): void;
}

/**
 * Browsers allow roughly 16 WebGL contexts per page. Instead of one context per
 * component, every effect draws through a single offscreen context and the
 * result is copied into a plain 2D canvas that lives inside the component.
 * That keeps normal DOM stacking, so text and children sit above the effect.
 */
let shared: Shared | null = null;
const entries = new Set<Entry>();
let raf = 0;
let begin = 0;
let teardownTimer: ReturnType<typeof setTimeout> | undefined;

function getShared(): Shared {
  if (teardownTimer !== undefined) {
    clearTimeout(teardownTimer);
    teardownTimer = undefined;
  }
  if (!shared) {
    const renderer = new Renderer({
      alpha: true,
      depth: false,
      dpr: 1,
      premultipliedAlpha: false,
    });
    const gl = renderer.gl;
    gl.enable(gl.SCISSOR_TEST);
    shared = {
      renderer,
      gl,
      canvas: gl.canvas as HTMLCanvasElement,
      width: 0,
      height: 0,
    };
    begin = performance.now();
  }
  return shared;
}

function releaseShared() {
  teardownTimer = undefined;
  if (entries.size > 0 || !shared) return;
  shared.gl.getExtension("WEBGL_lose_context")?.loseContext();
  shared = null;
}

function now() {
  return (performance.now() - begin) / 1000;
}

function ensureSize(s: Shared, w: number, h: number) {
  if (w <= s.width && h <= s.height) return;
  s.width = Math.max(s.width, w);
  s.height = Math.max(s.height, h);
  s.canvas.width = s.width;
  s.canvas.height = s.height;
  // Resizing resets the GL viewport behind OGL's cached copy, so invalidate it.
  (s.renderer as any).state.viewport.width = -1;
}

function draw(entry: Entry, seconds: number) {
  const s = shared;
  if (!s || !entry.devW || !entry.devH) return;
  ensureSize(s, entry.devW, entry.devH);

  // OGL derives the viewport from these fields on every render call.
  s.renderer.width = entry.devW;
  s.renderer.height = entry.devH;
  s.renderer.dpr = 1;
  s.gl.scissor(0, 0, entry.devW, entry.devH);

  entry.onFrame(seconds);

  // The effect occupies the bottom left corner of the shared canvas.
  entry.ctx.clearRect(0, 0, entry.devW, entry.devH);
  entry.ctx.drawImage(
    s.canvas,
    0,
    s.height - entry.devH,
    entry.devW,
    entry.devH,
    0,
    0,
    entry.devW,
    entry.devH
  );
}

function loop(time: number) {
  raf = 0;
  let active = false;
  for (const entry of entries) {
    if (entry.ready && entry.visible && !entry.reduceMotion && !entry.paused) {
      draw(entry, (time - begin) / 1000);
      active = true;
    }
  }
  if (active) raf = requestAnimationFrame(loop);
}

function wake() {
  if (!raf) raf = requestAnimationFrame(loop);
}

export interface Stage {
  /** The shared renderer. Build programs, textures and meshes with its gl. */
  renderer: Renderer;
  gl: Renderer["gl"];
  /** True while the user prefers reduced motion. Follows changes to the setting. */
  readonly reduceMotion: boolean;
  /** Begin observing size and visibility and start drawing. Call after building the scene. */
  start(): void;
  /**
   * Ask for a redraw after inputs change. With reduced motion this is the only
   * way frames are drawn, and calls are batched into one draw per frame.
   */
  invalidate(): void;
  /**
   * Stop or restart continuous drawing, for effects with nothing to animate at
   * times. The last frame stays on screen while paused.
   */
  setPaused(paused: boolean): void;
  destroy(): void;
}

export interface StageOptions {
  /** Called with the size in CSS pixels and the device pixels per CSS pixel. */
  onResize?(width: number, height: number, scale: number): void;
  /** Called every frame with elapsed seconds. Must call renderer.render itself. */
  onFrame(seconds: number): void;
  /**
   * Called on start, and whenever the effect starts or stops animating because
   * it left the screen or the user's motion preference changed.
   */
  onActive?(active: boolean): void;
}

export function createStage(container: HTMLElement, options: StageOptions): Stage {
  const s = getShared();
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%";
  container.appendChild(canvas);

  const entry: Entry = {
    canvas,
    ctx: canvas.getContext("2d")!,
    devW: 0,
    devH: 0,
    visible: true,
    reduceMotion: prefersReducedMotion(),
    ready: false,
    paused: false,
    onFrame: options.onFrame,
  };
  entries.add(entry);

  let resizeObserver: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  let drawQueued = false;

  const drawQueuedFrame = () => {
    drawQueued = false;
    if (entry.ready && entries.has(entry)) draw(entry, now());
  };

  const invalidate = () => {
    // Without reduced motion the shared loop already draws every frame.
    if (!entry.reduceMotion || drawQueued) return;
    drawQueued = true;
    // Motion values update in Motion's frame loop, so its render step runs
    // after all of this frame's changes.
    frame.render(drawQueuedFrame);
  };

  let active: boolean | undefined;
  const reportActive = () => {
    const next = entry.visible && !entry.reduceMotion;
    if (next === active) return;
    active = next;
    options.onActive?.(next);
  };

  const motionQuery = typeof matchMedia === "function" ? matchMedia(REDUCED_MOTION) : null;
  const onMotionPreference = () => {
    entry.reduceMotion = !!motionQuery?.matches;
    reportActive();
    if (entry.reduceMotion) invalidate();
    else wake();
  };

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2, MAX_SIDE / Math.max(w, h));
    entry.devW = Math.max(1, Math.round(w * scale));
    entry.devH = Math.max(1, Math.round(h * scale));
    canvas.width = entry.devW; // also clears the 2D canvas
    canvas.height = entry.devH;
    options.onResize?.(w, h, scale);
    entry.ready = true;
    draw(entry, now());
    wake();
  };

  return {
    renderer: s.renderer,
    gl: s.gl,
    get reduceMotion() {
      return entry.reduceMotion;
    },
    invalidate,
    setPaused(paused) {
      entry.paused = paused;
      if (!paused) wake();
    },
    start() {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();
      intersection = new IntersectionObserver(([e]) => {
        entry.visible = e.isIntersecting;
        reportActive();
        if (entry.visible) wake();
      });
      intersection.observe(container);
      reportActive();
      motionQuery?.addEventListener("change", onMotionPreference);
    },
    destroy() {
      resizeObserver?.disconnect();
      intersection?.disconnect();
      motionQuery?.removeEventListener("change", onMotionPreference);
      if (drawQueued) cancelFrame(drawQueuedFrame);
      entries.delete(entry);
      canvas.remove();
      if (entries.size === 0 && shared) {
        cancelAnimationFrame(raf);
        raf = 0;
        if (teardownTimer === undefined) {
          teardownTimer = setTimeout(releaseShared, TEARDOWN_DELAY);
        }
      }
    },
  };
}

export interface Transition {
  type?: "spring" | "tween";
  stiffness?: number;
  damping?: number;
  duration?: number;
  ease?: "linear" | "easeIn" | "easeOut" | "easeInOut";
}

/**
 * Animate a motion value, or jump straight to the target when the user prefers
 * reduced motion, so input still updates the frame without animating it.
 */
export function animateTo(
  stage: Stage,
  value: MotionValue<number>,
  target: number,
  transition: Transition
) {
  if (stage.reduceMotion) {
    value.stop();
    value.set(target);
  } else {
    animate(value, target, transition);
  }
}

/** Copy a motion value into a uniform and ask the stage for a redraw on every change. */
export function bindValue(
  stage: Stage,
  value: MotionValue<number>,
  apply: (v: number) => void
) {
  value.on("change", (v) => {
    apply(v);
    stage.invalidate();
  });
}

/**
 * A CSS url() for an image source. Escapes quotes, backslashes and newlines so
 * a source can't break out of the declaration.
 */
export function cssUrl(src: string): string {
  return `url("${src.replace(/["\\\n\r]/g, (c) => (c === "\n" || c === "\r" ? " " : `\\${c}`))}")`;
}

/** Free GPU objects an effect created on the shared context. */
export function disposeResources(
  gl: Renderer["gl"],
  res: { program?: any; texture?: any; geometry?: any }
) {
  if (res.program?.program) gl.deleteProgram(res.program.program);
  if (res.texture?.texture) gl.deleteTexture(res.texture.texture);
  if (res.geometry?.attributes) {
    for (const attr of Object.values<any>(res.geometry.attributes)) {
      if (attr?.buffer) gl.deleteBuffer(attr.buffer);
    }
  }
}
