<script setup lang="ts">
import { createShaderButton, type ShaderButtonOptions } from "@glimmerui/core";
import { isHoverPointer, pointerPosition, useController } from "./useController";

const props = defineProps<ShaderButtonOptions>();

const { host, controller } = useController(createShaderButton, () => ({
  colors: props.colors,
  speed: props.speed,
}));

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
// Keyboard focus lights the button up the same way hover does.
function onFocus(e: FocusEvent) {
  if ((e.currentTarget as HTMLElement).matches(":focus-visible")) {
    controller()?.setPointer(0.5, 0.5);
    controller()?.setHover(1);
  }
}
function onBlur() {
  controller()?.setHover(0);
}
</script>

<template>
  <button
    type="button"
    style="
      position: relative;
      overflow: hidden;
      isolation: isolate;
      border: 0;
      border-radius: 999px;
      padding: 0.8rem 1.5rem;
      background: transparent;
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    "
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @pointermove="onMove"
    @focus="onFocus"
    @blur="onBlur"
  >
    <span ref="host" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none" />
    <span style="position: relative; z-index: 1"><slot /></span>
  </button>
</template>
