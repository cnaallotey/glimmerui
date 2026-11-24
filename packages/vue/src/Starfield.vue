<script setup lang="ts">
import { createStarfield, type StarfieldOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<StarfieldOptions>();

const { host, controller } = useController(createStarfield, () => ({
  color: props.color,
  background: props.background,
  density: props.density,
  speed: props.speed,
}));

function onEnter(e: PointerEvent) {
  if (!isHoverPointer(e)) return;
  // Start where the pointer came in, not at the center.
  controller()?.setPointer(...pointerPosition(e));
  controller()?.setHover(1);
}
function onLeave() {
  controller()?.setHover(0);
}
function onMove(e: PointerEvent) {
  controller()?.setPointer(...pointerPosition(e));
}
</script>

<template>
  <div
    style="position: relative; overflow: hidden"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @pointermove="onMove"
  >
    <div ref="host" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none" />
    <div v-if="$slots.default" style="position: relative; z-index: 1">
      <slot />
    </div>
  </div>
</template>
