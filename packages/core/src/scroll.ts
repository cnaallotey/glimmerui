export interface ScrollTrackOptions {
  /**
   * What counts as progress.
   * - "through" (default): 0 as the element's top edge enters at the bottom of
   *   the screen, 1 once its bottom edge has left at the top.
   * - "within": for an element taller than the screen, usually holding sticky
   *   content. 0 when its top reaches the top of the screen, 1 when its bottom
   *   reaches the bottom.
   */
  range?: "through" | "within";
}

/**
 * Reports how far an element has scrolled through the screen, from 0 to 1, now
 * and on every scroll or resize that changes it. Works inside scrolling
 * containers too. Returns a function that stops tracking.
 */
export function trackScroll(
  element: Element,
  onProgress: (progress: number) => void,
  options: ScrollTrackOptions = {}
): () => void {
  const within = options.range === "within";
  let last = -1;
  let queued = 0;

  const measure = () => {
    queued = 0;
    const rect = element.getBoundingClientRect();
    const screen = window.innerHeight;
    const travelled = within ? -rect.top : screen - rect.top;
    // Without room to travel there's nothing to track, so it's all or nothing.
    const distance = Math.max(1, within ? rect.height - screen : screen + rect.height);
    const progress = Math.min(1, Math.max(0, travelled / distance));
    if (progress === last) return;
    last = progress;
    onProgress(progress);
  };
  const queue = () => {
    if (!queued) queued = requestAnimationFrame(measure);
  };

  // Scroll events don't bubble, but capturing on the window sees every container's.
  window.addEventListener("scroll", queue, { capture: true, passive: true });
  window.addEventListener("resize", queue);
  measure();

  return () => {
    cancelAnimationFrame(queued);
    window.removeEventListener("scroll", queue, { capture: true });
    window.removeEventListener("resize", queue);
  };
}

/**
 * Scroll progress for effects that play while on screen: 0 until the element
 * is well into view and 1 a little before it starts to leave.
 */
export function playProgress(through: number): number {
  const t = Math.min(1, Math.max(0, (through - 0.28) / 0.44));
  return t * t * (3 - 2 * t);
}
