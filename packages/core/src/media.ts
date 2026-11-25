import { Texture } from "ogl";
import { cssUrl, prefersReducedMotion, type Stage } from "./stage";

/** Options of every effect that draws an image or a video. */
export interface MediaOptions {
  /**
   * Treat the source as a video. Only needed when its URL doesn't end in a
   * video extension (.mp4, .webm, .mov, .m4v or .ogv), such as a blob URL.
   */
  video?: boolean;
  /** Hold a video on its current frame. Does nothing for images. */
  paused?: boolean;
}

const VIDEO_URL = /\.(mp4|m4v|mov|webm|ogv)(?:[?#]|$)/i;

/** Whether a source should be loaded as a video rather than an image. */
export function isVideo(src: string, options: MediaOptions = {}): boolean {
  return !!options.video || src.startsWith("data:video/") || VIDEO_URL.test(src);
}

/** A muted, looping, inline video. Nothing is fetched until it gets a src. */
function createVideo(): HTMLVideoElement {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  return video;
}

/** Stops a video and lets go of its download. */
function releaseVideo(video: HTMLVideoElement) {
  video.onloadeddata = null;
  video.pause();
  video.removeAttribute("src");
  video.load();
}

/** Plays or pauses. Browsers may refuse to play, for example to save power. */
function setPlaying(video: HTMLVideoElement, playing: boolean) {
  if (playing) video.play().catch(() => {});
  else video.pause();
}

export interface MediaTexture {
  texture: Texture;
  /**
   * Load a source if it changed. The current one stays until the new one is
   * ready, and results that arrive after a newer request are ignored.
   */
  load(src: string, options?: MediaOptions): void;
  /** Whether a video may play: the effect is on screen and motion is allowed. */
  setActive(active: boolean): void;
  /** Copy the video's latest frame. Call before every render. */
  update(): void;
  destroy(): void;
}

/** A texture fed by an image or a video. */
export function createMediaTexture(
  stage: Stage,
  onReady: (aspect: number) => void
): MediaTexture {
  const texture = new Texture(stage.gl, { generateMipmaps: false });
  let key: string | undefined;
  let image: HTMLImageElement | null = null;
  let loading: HTMLVideoElement | null = null;
  let video: HTMLVideoElement | null = null;
  let frameTime = -1;
  let active = true;
  let paused = false;

  const sync = () => {
    for (const v of [video, loading]) if (v) setPlaying(v, active && !paused);
  };

  const cancel = () => {
    if (image) image.onload = null;
    if (loading) releaseVideo(loading);
    image = loading = null;
  };

  const show = (source: HTMLImageElement | HTMLVideoElement, width: number, height: number) => {
    if (video && video !== source) releaseVideo(video);
    video = source instanceof HTMLVideoElement ? source : null;
    frameTime = -1;
    // OGL's types leave video out, but it uploads one like an image.
    texture.image = source as HTMLImageElement;
    texture.needsUpdate = true;
    onReady(width / height);
    stage.invalidate();
  };

  return {
    texture,
    load(src, options = {}) {
      const asVideo = isVideo(src, options);
      paused = !!options.paused;
      const nextKey = `${asVideo ? "video" : "image"}:${src}`;
      if (nextKey !== key) {
        key = nextKey;
        cancel();
        if (asVideo) {
          const next = createVideo();
          loading = next;
          next.onloadeddata = () => {
            next.onloadeddata = null;
            loading = null;
            show(next, next.videoWidth, next.videoHeight);
          };
          next.src = src;
        } else {
          const next = new Image();
          next.crossOrigin = "anonymous";
          image = next;
          next.onload = () => {
            image = null;
            show(next, next.naturalWidth, next.naturalHeight);
          };
          next.src = src;
        }
      }
      sync();
    },
    setActive(next) {
      active = next;
      sync();
    },
    update() {
      if (!video || video.readyState < 2 || video.currentTime === frameTime) return;
      frameTime = video.currentTime;
      texture.needsUpdate = true;
    },
    destroy() {
      cancel();
      if (video) releaseVideo(video);
      video = null;
    },
  };
}

/** Shows the plain image or video when WebGL is unavailable, covering the element. */
export function createMediaFallback(container: HTMLElement) {
  let video: HTMLVideoElement | null = null;
  const clear = () => {
    if (!video) return;
    releaseVideo(video);
    video.remove();
    video = null;
  };
  return {
    show(src: string, options: MediaOptions = {}) {
      if (!isVideo(src, options)) {
        clear();
        container.style.background = `center / cover no-repeat ${cssUrl(src)}`;
        return;
      }
      if (!video) {
        container.style.background = "";
        video = createVideo();
        video.style.cssText = "display:block;width:100%;height:100%;object-fit:cover";
        container.appendChild(video);
      }
      if (video.getAttribute("src") !== src) video.src = src;
      setPlaying(video, !options.paused && !prefersReducedMotion());
    },
    destroy() {
      clear();
      container.style.background = "";
    },
  };
}
