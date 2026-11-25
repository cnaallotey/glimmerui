<script lang="ts">
  import { createTiltCard, type TiltCardOptions } from "@glimmerui/core";
  import type { PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    src,
    maxTilt,
    radius,
    glare,
    video,
    paused,
    alt,
    style = "",
    ref = $bindable(),
    children,
    onpointerenter,
    onpointerleave,
    onpointermove,
    ...rest
  }: EffectProps<TiltCardOptions & { /** Accessible description of the image. */ alt: string }> = $props();

  const effect = useController(createTiltCard, () => ({ src, maxTilt, radius, glare, video, paused }));

  const enter: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerenter?.(e);
    if (isHoverPointer(e)) effect.current?.setHover(1);
  };
  const leave: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerleave?.(e);
    effect.current?.setHover(0);
    effect.current?.setPointer(0.5, 0.5);
  };
  const move: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointermove?.(e);
    effect.current?.setPointer(...pointerPosition(e));
  };
</script>

<div
  bind:this={ref}
  role="img"
  aria-label={alt}
  {...rest}
  style="position: relative; {style}"
  onpointerenter={enter}
  onpointerleave={leave}
  onpointermove={move}
>
  <div bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></div>
  {#if children}
    <div style="position: relative; z-index: 1">{@render children()}</div>
  {/if}
</div>
