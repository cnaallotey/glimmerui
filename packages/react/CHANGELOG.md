# @glimmerui/react

## 0.2.0

### Minor Changes

- bc2ffce: - New package: `@glimmerui/svelte`, with every component for Svelte 5 and SvelteKit.
  - Seven new components: `ImageTransition`, `ScrollImage`, `RippleImage`, `RainImage`, `LightRays`, `Plasma` and `BorderBeam`.
  - Video: every image component plays a video when `src` is one. `video` marks URLs without a video extension, and `paused` holds the current frame.
  - Scroll: `ImageReveal` takes `scroll` and `progress`. `useScrollProgress` (React, Vue and Nuxt), the `scrollProgress` action (Svelte) and `trackScroll` (core) measure progress for anything else.
  - Core: `createImageEffect` specs can take a `frame` hook that runs before every frame.

### Patch Changes

- Updated dependencies [bc2ffce]
  - @glimmerui/core@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [4c7e44b]
  - @glimmerui/core@0.1.1

## 0.1.0

### Minor Changes

- d52e17f: First release of Glimmer UI: `ShaderGradient`, `ImageDistortion`, `TiltCard`, `ImageReveal`, `LensImage`, `Aurora`, `DotGrid`, `LiquidMetal`, `Particles`, `HalftoneImage`, `PixelImage`, `MeshGradient`, `Silk`, `Caustics`, `ContourLines`, `Starfield`, `Voronoi`, `GridFloor`, `InkSmoke`, `GlitchImage`, `DitherImage`, `AsciiImage`, `DuotoneImage`, `FogImage`, `KaleidoscopeImage`, `HoloCard`, `SpotlightCard`, `ShaderButton`, `ShaderText` and `CursorTrail` for React, Vue and Nuxt, sharing one WebGL context per page.

### Patch Changes

- Updated dependencies [d52e17f]
  - @glimmerui/core@0.1.0
