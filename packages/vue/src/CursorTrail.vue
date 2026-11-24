<script setup lang="ts">
import { createCursorTrail, type CursorTrailOptions } from "@glimmerui/core";
import { useController } from "./useController";

const props = withDefaults(defineProps<CursorTrailOptions & { zIndex?: number }>(), { zIndex: 9999 });

// A glowing trail that follows the mouse across the whole page. Render it once,
// anywhere; it draws in a fixed layer above the page that ignores the pointer.
const { host } = useController(createCursorTrail, () => ({
  color: props.color,
  tail: props.tail,
  width: props.width,
  length: props.length,
}));
</script>

<template>
  <div
    ref="host"
    aria-hidden="true"
    :style="{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: props.zIndex }"
  />
</template>
