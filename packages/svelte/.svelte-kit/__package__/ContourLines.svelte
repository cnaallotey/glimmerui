<script lang="ts">
  import { createContourLines, type ContourLinesOptions } from "@glimmerui/core";
  import type { PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    color,
    accent,
    density,
    width,
    speed,
    style = "",
    ref = $bindable(),
    children,
    onpointerenter,
    onpointerleave,
    onpointermove,
    ...rest
  }: EffectProps<ContourLinesOptions> = $props();

  const effect = useController(createContourLines, () => ({ color, accent, density, width, speed }));

  const enter: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerenter?.(e);
    if (!isHoverPointer(e)) return;
    // Start where the pointer came in, not at the center.
    effect.current?.setPointer(...pointerPosition(e));
    effect.current?.setHover(1);
  };
  const leave: PointerEventHandler<HTMLDivElement> = (e) => {
    onpointerleave?.(e);
    effect.current?.setHover(0);
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
