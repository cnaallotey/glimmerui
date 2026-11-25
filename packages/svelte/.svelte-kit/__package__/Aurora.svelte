<script lang="ts">
  import { createAurora, type AuroraOptions } from "@glimmerui/core";
  import type { PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    colors,
    background,
    speed,
    intensity,
    style = "",
    ref = $bindable(),
    children,
    onpointerenter,
    onpointerleave,
    onpointermove,
    ...rest
  }: EffectProps<AuroraOptions> = $props();

  const effect = useController(createAurora, () => ({ colors, background, speed, intensity }));

  const enter: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerenter?.(e);
    if (isHoverPointer(e)) effect.current?.setIntensity(1);
  };
  const leave: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerleave?.(e);
    effect.current?.setIntensity(0);
  };
  const move: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointermove?.(e);
    effect.current?.setPointer(...pointerPosition(e));
  };
</script>

<div
  bind:this={ref}
  {...rest}
  style="position: relative; overflow: hidden; {style}"
  onpointerenter={enter}
  onpointerleave={leave}
  onpointermove={move}
>
  <div bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></div>
  {#if children}
    <div style="position: relative; z-index: 1">{@render children()}</div>
  {/if}
</div>
