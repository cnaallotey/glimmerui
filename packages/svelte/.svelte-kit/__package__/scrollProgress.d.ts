import { type ScrollTrackOptions } from "@glimmerui/core";
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
export declare function scrollProgress(element: Element, options: ScrollProgressOptions): {
    update(next: ScrollProgressOptions): void;
    destroy(): void;
};
