<!--
@component
A glowing trail that follows the mouse across the whole page. Render it once,
anywhere; it draws in a fixed layer above the page that ignores the pointer.
-->
<script lang="ts">
  import { createCursorTrail, type CursorTrailOptions } from "@glimmerui/core";
  import { useController } from "./controller.svelte.js";

  interface Props extends CursorTrailOptions {
    /** Stacking order of the trail's full-screen layer. Defaults to 9999. */
    zIndex?: number;
  }

  let { color, tail, width, length, zIndex = 9999 }: Props = $props();

  const effect = useController(createCursorTrail, () => ({ color, tail, width, length }));
</script>

<div
  bind:this={effect.host}
  aria-hidden="true"
  style="position: fixed; inset: 0; pointer-events: none; z-index: {zIndex}"
></div>
