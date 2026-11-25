<script lang="ts">
  import { createScrollImage, type ScrollImageOptions } from "@glimmerui/core";
  import { useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    src,
    strength,
    split,
    video,
    paused,
    alt,
    style = "",
    ref = $bindable(),
    children,
    ...rest
  }: EffectProps<ScrollImageOptions & { /** Accessible description of the image. */ alt: string }> = $props();

  const effect = useController(createScrollImage, () => ({ src, strength, split, video, paused }));
</script>

<div
  bind:this={ref}
  role="img"
  aria-label={alt}
  {...rest}
  style="position: relative; overflow: hidden; {style}"
>
  <div bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></div>
  {#if children}
    <div style="position: relative; z-index: 1">{@render children()}</div>
  {/if}
</div>
