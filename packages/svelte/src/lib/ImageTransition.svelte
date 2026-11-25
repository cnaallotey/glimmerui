<script lang="ts">
  import {
    createImageTransition,
    transitionLabel,
    type ImageTransitionOptions,
    type TransitionImage,
  } from "@glimmerui/core";
  import { useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  interface Options extends Omit<ImageTransitionOptions, "images"> {
    /** The images or videos to move through, each with its accessible description. */
    images: TransitionImage[];
  }

  let {
    images,
    index,
    effect: transition,
    duration,
    scroll,
    progress,
    video,
    paused,
    style = "",
    ref = $bindable(),
    children,
    ...rest
  }: EffectProps<Options> = $props();

  const effect = useController(createImageTransition, () => ({
    images: images.map((image) => image.src),
    index,
    effect: transition,
    duration,
    scroll,
    progress,
    video,
    paused,
  }));
</script>

<div
  bind:this={ref}
  role="img"
  aria-label={transitionLabel(images, { index, scroll, progress })}
  {...rest}
  style="position: relative; overflow: hidden; {style}"
>
  <div bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></div>
  {#if children}
    <div style="position: relative; z-index: 1">{@render children()}</div>
  {/if}
</div>
