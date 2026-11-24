<script setup lang="ts">
import { createHoloCard, type HoloCardOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<HoloCardOptions & { alt: string }>();

const { host, controller } = useController(createHoloCard, () => ({
  src: props.src,
  maxTilt: props.maxTilt,
  radius: props.radius,
  glare: props.glare,
  foil: props.foil,
}));

function onEnter(e: PointerEvent) {
  if (isHoverPointer(e)) controller()?.setHover(1);
}
function onLeave() {
  controller()?.setHover(0);
  controller()?.setPointer(0.5, 0.5);
}
function onMove(e: PointerEvent) {
  controller()?.setPointer(...pointerPosition(e));
}
</script>

<template>
  <div
    role="img"
    :aria-label="alt"
    style="position: relative"
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
