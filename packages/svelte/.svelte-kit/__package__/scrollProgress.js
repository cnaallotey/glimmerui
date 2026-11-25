import { trackScroll } from "@glimmerui/core";
/**
 * An action that reports how far its element has scrolled through the screen:
 *
 *   <section use:scrollProgress={{ onprogress: (p) => (progress = p) }}>
 *
 * Use it to drive any prop, such as ImageReveal's progress.
 */
export function scrollProgress(element, options) {
    let current = options;
    const start = () => trackScroll(element, (p) => current.onprogress(p), { range: current.range });
    let stop = start();
    return {
        update(next) {
            const restart = next.range !== current.range;
            current = next;
            if (!restart)
                return;
            stop();
            stop = start();
        },
        destroy() {
            stop();
        },
    };
}
