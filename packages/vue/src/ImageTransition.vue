<script setup lang="ts">
import {
  createImageTransition,
  transitionLabel,
  type ImageTransitionOptions,
  type TransitionImage,
} from "@glimmerui/core";
import { useController } from "./useController";

const props = defineProps<
  Omit<ImageTransitionOptions, "images"> & {
    /** The images or videos to move through, each with its accessible description. */
    images: TransitionImage[];
  }
>();

const { host } = useController(createImageTransition, () => ({
  images: props.images.map((image) => image.src),
  index: props.index,
  effect: props.effect,
  duration: props.duration,
  scroll: props.scroll,
  progress: props.progress,
  video: props.video,
  paused: props.paused,
}));
</script>

<template>
  <div
    role="img"
    :aria-label="transitionLabel(images, props)"
    style="position: relative; overflow: hidden"
  >
    <div ref="host" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none" />
    <div v-if="$slots.default" style="position: relative; z-index: 1">
      <slot />
    </div>
  </div>
</template>
