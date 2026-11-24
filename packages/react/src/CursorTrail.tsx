import { createCursorTrail, type CursorTrailOptions } from "@glimmerui/core";
import { useController } from "./shared";

export interface CursorTrailProps extends CursorTrailOptions {
  /** Stacking order of the trail's full-screen layer. Defaults to 9999. */
  zIndex?: number;
}

/**
 * A glowing trail that follows the mouse across the whole page. Render it once,
 * anywhere; it draws in a fixed layer above the page that ignores the pointer.
 */
export function CursorTrail({ color, tail, width, length, zIndex = 9999 }: CursorTrailProps) {
  const { host } = useController(createCursorTrail, { color, tail, width, length }, [color, tail, width, length]);
  return (
    <div ref={host} aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex }} />
  );
}
