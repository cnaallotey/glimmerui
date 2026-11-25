interface Controller<O> {
    update(options: O): void;
    destroy(): void;
}
/**
 * Builds an effect once its host element exists and applies later option
 * changes in place. Effects never run on the server.
 */
export declare function useController<O, C extends Controller<O>>(create: (host: HTMLElement, options: O) => C, options: () => O): {
    /** The element the effect draws in. Set it with bind:this. */
    host: HTMLElement | null;
    /** The running effect. */
    readonly current: C | null;
};
type HostEvent = PointerEvent & {
    currentTarget: EventTarget & HTMLElement;
};
/** Pointer position in 0 to 1 space inside the element, origin at the bottom left. */
export declare function pointerPosition(e: HostEvent): [number, number];
/** Hover effects follow mouse and pen. Touch has no hover, matching CSS :hover. */
export declare function isHoverPointer(e: PointerEvent): boolean;
export {};
