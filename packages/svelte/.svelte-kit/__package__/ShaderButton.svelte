<script lang="ts">
  import { createShaderButton, type ShaderButtonOptions } from "@glimmerui/core";
  import type { FocusEventHandler, HTMLButtonAttributes, PointerEventHandler } from "svelte/elements";
  import { isHoverPointer, pointerPosition, useController } from "./controller.svelte.js";
  import type { EffectProps } from "./types.js";

  let {
    colors,
    speed,
    style = "",
    ref = $bindable(),
    children,
    onpointerenter,
    onpointerleave,
    onpointermove,
    onfocus,
    onblur,
    ...rest
  }: EffectProps<ShaderButtonOptions, HTMLButtonAttributes> = $props();

  const effect = useController(createShaderButton, () => ({ colors, speed }));

  const enter: PointerEventHandler<HTMLButtonElement> = (e) => {
    onpointerenter?.(e);
    if (!isHoverPointer(e)) return;
    effect.current?.setPointer(...pointerPosition(e));
    effect.current?.setHover(1);
  };
  const leave: PointerEventHandler<HTMLButtonElement> = (e) => {
    onpointerleave?.(e);
    effect.current?.setHover(0);
  };
  const move: PointerEventHandler<HTMLButtonElement> = (e) => {
    onpointermove?.(e);
    effect.current?.setPointer(...pointerPosition(e));
  };
  // Keyboard focus lights the button up the same way hover does.
  const focus: FocusEventHandler<HTMLButtonElement> = (e) => {
    onfocus?.(e);
    if (e.currentTarget.matches(":focus-visible")) {
      effect.current?.setPointer(0.5, 0.5);
      effect.current?.setHover(1);
    }
  };
  const blur: FocusEventHandler<HTMLButtonElement> = (e) => {
    onblur?.(e);
    effect.current?.setHover(0);
  };
</script>

<button
  bind:this={ref}
  type="button"
  {...rest}
  style="position: relative; overflow: hidden; isolation: isolate; border: 0; border-radius: 999px; padding: 0.8rem 1.5rem; background: transparent; color: #fff; font: inherit; font-weight: 600; cursor: pointer; {style}"
  onpointerenter={enter}
  onpointerleave={leave}
  onpointermove={move}
  onfocus={focus}
  onblur={blur}
>
  <span bind:this={effect.host} aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none"></span>
  <span style="position: relative; z-index: 1">{@render children?.()}</span>
</button>
