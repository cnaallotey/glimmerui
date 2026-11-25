<script lang="ts">
  import { createAsciiImage, type AsciiImageOptions } from "@glimmerui/core";
  import type { PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    src,
    cell,
    color,
    background,
    colored,
    radius,
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
  }: EffectProps<AsciiImageOptions & { /** Accessible description of the image. */ alt: string }> = $props();

  const effect = useController(createAsciiImage, () => ({ src, cell, color, background, colored, radius, video, paused }));

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
  // Touch has no hover, so a tap toggles the effect around the tapped point.
  let tapped = false;
  const down: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerdown?.(e);
    if (isHoverPointer(e)) return;
    tapped = !tapped;
    effect.current?.setPointer(...pointerPosition(e));
    effect.current?.setHover(tapped ? 1 : 0);
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
