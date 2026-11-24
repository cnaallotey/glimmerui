import { onBeforeUnmount, ref, watch } from "vue";

interface Controller<O> {
  update(options: O): void;
  destroy(): void;
}

/**
 * Builds an effect when the host element appears and applies option changes
 * in place. Watching the element rather than using onMounted matters in Nuxt,
 * where client-only components mount a placeholder before the real template.
 */
export function useController<O, C extends Controller<O>>(
  create: (host: HTMLElement, options: O) => C,
  options: () => O
) {
  const host = ref<HTMLDivElement | null>(null);
  let ctrl: C | null = null;

  const destroy = () => {
    ctrl?.destroy();
    ctrl = null;
  };

  watch(
    host,
    (el) => {
      destroy();
      if (el) ctrl = create(el, options());
    },
    { flush: "post" }
  );
  watch(options, (next) => ctrl?.update(next), { deep: true });
  onBeforeUnmount(destroy);

  return { host, controller: () => ctrl };
}

/** Pointer position in 0 to 1 space inside the element, origin at the bottom left. */
export function pointerPosition(e: PointerEvent): [number, number] {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return [(e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height];
}

/** Hover effects follow mouse and pen. Touch has no hover, matching CSS :hover. */
export function isHoverPointer(e: PointerEvent) {
  return e.pointerType !== "touch";
}
