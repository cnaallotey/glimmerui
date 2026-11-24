<script setup lang="ts">
import { createShaderGradient, type ShaderGradientOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<ShaderGradientOptions>();

const { host, controller } = useController(createShaderGradient, () => ({
  colors: props.colors,
  speed: props.speed,
  intensity: props.intensity,
}));

function onEnter(e: PointerEvent) {
  if (isHoverPointer(e)) controller()?.setIntensity(1);
}
function onLeave() {
  controller()?.setIntensity(0);
  controller()?.setPointer(0.5, 0.5);
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
    <div style="position: relative; z-index: 1">
      <slot />
    </div>
  </div>
</template>
