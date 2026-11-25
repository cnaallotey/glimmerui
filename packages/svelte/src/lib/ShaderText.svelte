<script lang="ts">
  import { createShaderText, type ShaderTextOptions } from "@glimmerui/core";
  import type { HTMLAttributes, PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    text,
    colors,
    speed,
    style = "",
    ref = $bindable(),
    onpointerenter,
    onpointerleave,
    onpointermove,
    ...rest
  }: EffectProps<ShaderTextOptions, Omit<HTMLAttributes<HTMLSpanElement>, "children">> = $props();

  // The real text stays in the page, transparent but selectable and read by
  // screen readers; the effect draws behind it.
  let textElement = $state<HTMLElement>();
  const effect = useController(
    (host, options: ShaderTextOptions) => createShaderText(host, options, textElement),
    () => ({ text, colors, speed })
  );

  const enter: PointerEventHandler<HTMLSpanElement> = (e) => {
    onpointerenter?.(e);
    if (!isHoverPointer(e)) return;
    effect.current?.setPointer(...pointerPosition(e));
    effect.current?.setHover(1);
  };
  const leave: PointerEventHandler<HTMLSpanElement> = (e) => {
    onpointerleave?.(e);
    effect.current?.setHover(0);
  };
  const move: PointerEventHandler<HTMLSpanElement> = (e) => {
    onpointermove?.(e);
    effect.current?.setPointer(...pointerPosition(e));
  };
</script>

<span
  bind:this={ref}
  {...rest}
  style="position: relative; display: inline-block; {style}"
  onpointerenter={enter}
  onpointerleave={leave}
  onpointermove={move}
>
  <span bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></span><span
    bind:this={textElement}
    style="position: relative; z-index: 1; color: transparent; white-space: pre">{text}</span
  >
</span>
