<script setup lang="ts">
import { createScrollImage, type ScrollImageOptions } from "@glimmerui/core";
import { useController } from "./useController";

const props = defineProps<ScrollImageOptions & { alt: string }>();

const { host } = useController(createScrollImage, () => ({
  src: props.src,
  strength: props.strength,
  split: props.split,
  video: props.video,
  paused: props.paused,
}));
</script>

<template>
  <div role="img" :aria-label="alt" style="position: relative; overflow: hidden">
    <div ref="host" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none" />
    <div v-if="$slots.default" style="position: relative; z-index: 1">
      <slot />
    </div>
  </div>
</template>
