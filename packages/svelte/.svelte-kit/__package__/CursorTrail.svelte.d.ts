import { type CursorTrailOptions } from "@glimmerui/core";
interface Props extends CursorTrailOptions {
    /** Stacking order of the trail's full-screen layer. Defaults to 9999. */
    zIndex?: number;
}
/**
 * A glowing trail that follows the mouse across the whole page. Render it once,
 * anywhere; it draws in a fixed layer above the page that ignores the pointer.
 */
declare const CursorTrail: import("svelte").Component<Props, {}, "">;
type CursorTrail = ReturnType<typeof CursorTrail>;
export default CursorTrail;
