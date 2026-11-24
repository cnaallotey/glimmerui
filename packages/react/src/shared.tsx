import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from "react";

/** Pointer position in 0 to 1 space inside the element, origin at the bottom left. */
export function pointerPosition(e: PointerEvent<HTMLElement>): [number, number] {
  const rect = e.currentTarget.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    1 - (e.clientY - rect.top) / rect.height,
  ];
}

/** Hover effects follow mouse and pen. Touch has no hover, matching CSS :hover. */
export function isHoverPointer(e: PointerEvent<HTMLElement>) {
  return e.pointerType !== "touch";
}

/** The canvas host. A separate element, so React never reconciles the canvas. */
export const hostStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

/** Children sit above the effect. Skips the wrapper when there is nothing to render. */
export function Content({ children }: { children?: ReactNode }) {
  if (children === undefined || children === null || typeof children === "boolean") {
    return null;
  }
  return <div style={{ position: "relative", zIndex: 1 }}>{children}</div>;
}

interface Controller<O> {
  update(options: O): void;
  destroy(): void;
}

/**
 * Builds an effect once on mount and applies later option changes in place.
 * Returns the ref for the canvas host and a ref to the running controller.
 */
export function useController<O, C extends Controller<O>>(
  create: (host: HTMLElement, options: O) => C,
  options: O,
  deps: unknown[]
) {
  // Typed loosely so the host can be a div or, inside buttons and text, a span.
  const host = useRef<HTMLElement>(null) as RefObject<any>;
  const ctrl = useRef<C | null>(null);

  useEffect(() => {
    if (!host.current) return;
    ctrl.current = create(host.current, options);
    return () => {
      ctrl.current?.destroy();
      ctrl.current = null;
    };
  }, []);

  useEffect(() => {
    ctrl.current?.update(options);
  }, deps);

  return { host, ctrl };
}
