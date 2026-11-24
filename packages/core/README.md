# @glimmerui/core

Framework-agnostic WebGL effects for Glimmer UI, built on OGL and driven by Motion. Use `@glimmerui/react`, `@glimmerui/vue` or `@glimmerui/nuxt` unless you are writing your own wrapper.

```ts
import { createTiltCard } from "@glimmerui/core";

const card = createTiltCard(element, { src: "/photo.jpg" });
element.addEventListener("pointermove", (e) => {
  const r = element.getBoundingClientRect();
  card.setPointer((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
});
// card.update({ src: "/other.jpg" }) changes options in place; card.destroy() cleans up.
```

All effects on a page share one WebGL context, fall back to plain CSS without WebGL, pause offscreen and respect `prefers-reduced-motion`.
