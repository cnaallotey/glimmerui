<script lang="ts">
  import { createRippleImage, type RippleImageOptions } from "@glimmerui/core";
  import type { PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    src,
    strength,
    speed,
    video,
    paused,
    alt,
    style = "",
    ref = $bindable(),
    children,
    onpointerenter,
    onpointerleave,
    onpointermove,
    onpointerdown,
    ...rest
  }: EffectProps<RippleImageOptions & { /** Accessible description of the image. */ alt: string }> = $props();

  const effect = useController(createRippleImage, () => ({ src, strength, speed, video, paused }));

  const enter: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerenter?.(e);
    if (!isHoverPointer(e)) return;
    // Start where the pointer came in, not at the center.
    effect.current?.setPointer(...pointerPosition(e));
    effect.current?.setHover(1);
  };
  const leave: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerleave?.(e);
    if (isHoverPointer(e)) effect.current?.setHover(0);
  };
  const move: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointermove?.(e);
    effect.current?.setPointer(...pointerPosition(e));
  };
  // A click or tap drops a bigger stone.
  const down: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerdown?.(e);
    effect.current?.drop(...pointerPosition(e));
  };
</script>

<div
  bind:this={ref}
  role="img"
  aria-label={alt}
  {...rest}
  style="position: relative; overflow: hidden; {style}"
  onpointerenter={enter}
  onpointerleave={leave}
  onpointermove={move}
  onpointerdown={down}
>
  <div bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></div>
  {#if children}
    <div style="position: relative; z-index: 1">{@render children()}</div>
  {/if}
</div>
