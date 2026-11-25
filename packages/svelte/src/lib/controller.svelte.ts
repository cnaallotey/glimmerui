import { untrack } from "svelte";

interface Controller<O> {
  update(options: O): void;
  destroy(): void;
}

/**
 * Builds an effect once its host element exists and applies later option
 * changes in place. Effects never run on the server.
 */
export function useController<O, C extends Controller<O>>(
  create: (host: HTMLElement, options: O) => C,
  options: () => O
) {
  let host = $state<HTMLElement | null>(null);
  let current: C | null = null;

  $effect(() => {
    if (!host) return;
    const el = host;
    current = untrack(() => create(el, options()));
    return () => {
      current?.destroy();
      current = null;
    };
  });
  $effect(() => {
    current?.update(options());
  });

  return {
    /** The element the effect draws in. Set it with bind:this. */
    get host() {
      return host;
    },
    set host(el) {
      host = el;
    },
    /** The running effect. */
    get current() {
      return current;
    },
  };
}

type HostEvent = PointerEvent & { currentTarget: EventTarget & HTMLElement };

/** Pointer position in 0 to 1 space inside the element, origin at the bottom left. */
export function pointerPosition(e: HostEvent): [number, number] {
  const rect = e.currentTarget.getBoundingClientRect();
  return [(e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height];
}

/** Hover effects follow mouse and pen. Touch has no hover, matching CSS :hover. */
export function isHoverPointer(e: PointerEvent) {
  return e.pointerType !== "touch";
}
