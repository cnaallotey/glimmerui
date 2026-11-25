<script setup lang="ts">
import { createImageReveal, type ImageRevealOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<ImageRevealOptions & { alt: string }>();

const { host, controller } = useController(createImageReveal, () => ({
  src: props.src,
  revealSrc: props.revealSrc,
  video: props.video,
  paused: props.paused,
  scroll: props.scroll,
  progress: props.progress,
}));

// Touch has no hover, so a tap toggles the reveal instead.
let tapped = false;

function onEnter(e: PointerEvent) {
  if (!isHoverPointer(e)) return;
  controller()?.setPointer(...pointerPosition(e));
  controller()?.setHover(1);
}
function onLeave(e: PointerEvent) {
  if (isHoverPointer(e)) controller()?.setHover(0);
}
function onMove(e: PointerEvent) {
  controller()?.setPointer(...pointerPosition(e));
}
function onDown(e: PointerEvent) {
  if (isHoverPointer(e)) return;
  tapped = !tapped;
  controller()?.setPointer(...pointerPosition(e));
  controller()?.setHover(tapped ? 1 : 0);
}
</script>

<template>
  <div
    role="img"
    :aria-label="alt"
    style="position: relative; overflow: hidden"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @pointermove="onMove"
    @pointerdown="onDown"
  >
    <div ref="host" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none" />
    <div v-if="$slots.default" style="position: relative; z-index: 1">
      <slot />
    </div>
  </div>
</template>
