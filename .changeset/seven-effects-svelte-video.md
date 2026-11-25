---
"@glimmerui/core": minor
"@glimmerui/react": minor
"@glimmerui/vue": minor
"@glimmerui/nuxt": minor
"@glimmerui/svelte": minor
---

- New package: `@glimmerui/svelte`, with every component for Svelte 5 and SvelteKit.
- Seven new components: `ImageTransition`, `ScrollImage`, `RippleImage`, `RainImage`, `LightRays`, `Plasma` and `BorderBeam`.
- Video: every image component plays a video when `src` is one. `video` marks URLs without a video extension, and `paused` holds the current frame.
- Scroll: `ImageReveal` takes `scroll` and `progress`. `useScrollProgress` (React, Vue and Nuxt), the `scrollProgress` action (Svelte) and `trackScroll` (core) measure progress for anything else.
- Core: `createImageEffect` specs can take a `frame` hook that runs before every frame.
