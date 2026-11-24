<script setup lang="ts">
import { ref } from "vue";
import { createShaderText, type ShaderTextOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<ShaderTextOptions>();
const textEl = ref<HTMLSpanElement | null>(null);

// The real text stays in the page, transparent but selectable and read by
// screen readers; the effect draws behind it.
const { host, controller } = useController(
  (el, options) => createShaderText(el, options, textEl.value ?? undefined),
  () => ({ text: props.text, colors: props.colors, speed: props.speed })
);

function onEnter(e: PointerEvent) {
  if (!isHoverPointer(e)) return;
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
  <span
    style="position: relative; display: inline-block"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @pointermove="onMove"
  >
    <span ref="host" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none" />
    <span ref="textEl" style="position: relative; z-index: 1; color: transparent; white-space: pre">{{ text }}</span>
  </span>
</template>
