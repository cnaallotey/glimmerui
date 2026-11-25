<script setup lang="ts">
import { createRippleImage, type RippleImageOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<RippleImageOptions & { alt: string }>();

const { host, controller } = useController(createRippleImage, () => ({
  src: props.src,
  strength: props.strength,
  speed: props.speed,
  video: props.video,
  paused: props.paused,
}));

function onEnter(e: PointerEvent) {
  if (!isHoverPointer(e)) return;
  // Start where the pointer came in, not at the center.
  controller()?.setPointer(...pointerPosition(e));
  controller()?.setHover(1);
}
function onLeave(e: PointerEvent) {
  if (isHoverPointer(e)) controller()?.setHover(0);
}
function onMove(e: PointerEvent) {
  controller()?.setPointer(...pointerPosition(e));
}
// A click or tap drops a bigger stone.
function onDown(e: PointerEvent) {
  controller()?.drop(...pointerPosition(e));
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
