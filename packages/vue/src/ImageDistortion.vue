<script setup lang="ts">
import { createImageDistortion, type ImageDistortionOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<ImageDistortionOptions & { alt: string }>();

const { host, controller } = useController(createImageDistortion, () => ({
  src: props.src,
  strength: props.strength,
}));

function onEnter(e: PointerEvent) {
  if (isHoverPointer(e)) controller()?.setHover(1);
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
    role="img"
    :aria-label="alt"
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
