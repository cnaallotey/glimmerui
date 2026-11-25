import { onBeforeUnmount, ref, unref, watch, type MaybeRef, type Ref } from "vue";
import { trackScroll, type ScrollTrackOptions } from "@glimmerui/core";

/**
 * How far an element has scrolled through the screen, from 0 to 1. Use it to
 * drive any prop, such as ImageReveal's progress.
 */
export function useScrollProgress(
  element: MaybeRef<Element | null | undefined>,
  options: ScrollTrackOptions = {}
): Ref<number> {
  const progress = ref(0);
  let stop: (() => void) | undefined;
  const end = () => {
    stop?.();
    stop = undefined;
  };
  watch(
    () => unref(element),
    (el) => {
      end();
      if (el) stop = trackScroll(el, (p) => (progress.value = p), options);
    },
    { immediate: true, flush: "post" }
  );
  onBeforeUnmount(end);
  return progress;
}
