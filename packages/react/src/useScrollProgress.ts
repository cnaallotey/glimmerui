import { useEffect, useState, type RefObject } from "react";
import { trackScroll, type ScrollTrackOptions } from "@glimmerui/core";

/**
 * How far an element has scrolled through the screen, from 0 to 1. Use it to
 * drive any prop, such as ImageReveal's progress.
 */
export function useScrollProgress(
  ref: RefObject<Element | null>,
  { range }: ScrollTrackOptions = {}
): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (ref.current) return trackScroll(ref.current, setProgress, { range });
  }, [ref, range]);
  return progress;
}
