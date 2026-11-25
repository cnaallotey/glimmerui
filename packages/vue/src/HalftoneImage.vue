<script setup lang="ts">
import { createHalftoneImage, type HalftoneImageOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<HalftoneImageOptions & { alt: string }>();

const { host, controller } = useController(createHalftoneImage, () => ({
  src: props.src,
  cell: props.cell,
  ink: props.ink,
  paper: props.paper,
  radius: props.radius,
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
// Touch has no hover, so a tap toggles the effect around the tapped point.
let tapped = false;
function onDown(e: PointerEvent) {
  if (isHoverPointer(e)) return;
  tapped = !tapped;
  controller()?.setPointer(...pointerPosition(e));
  controller()?.setHover(tapped ? 1 : 0);
}
function onMove(e: PointerEvent) {
  controller()?.setPointer(...pointerPosition(e));
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
