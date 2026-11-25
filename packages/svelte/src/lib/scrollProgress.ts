import { trackScroll, type ScrollTrackOptions } from "@glimmerui/core";

export interface ScrollProgressOptions extends ScrollTrackOptions {
  /** Called with the progress, from 0 to 1, now and whenever scrolling changes it. */
  onprogress(progress: number): void;
}

/**
 * An action that reports how far its element has scrolled through the screen:
 *
 *   <section use:scrollProgress={{ onprogress: (p) => (progress = p) }}>
 *
 * Use it to drive any prop, such as ImageReveal's progress.
 */
export function scrollProgress(element: Element, options: ScrollProgressOptions) {
  let current = options;
  const start = () => trackScroll(element, (p) => current.onprogress(p), { range: current.range });
  let stop = start();
  return {
    update(next: ScrollProgressOptions) {
      const restart = next.range !== current.range;
      current = next;
      if (!restart) return;
      stop();
      stop = start();
    },
    destroy() {
      stop();
    },
  };
}
