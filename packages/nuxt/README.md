# @glimmerui/nuxt

Nuxt module for Glimmer UI. Auto-imports all thirty components (`ShaderGradient`, `ImageDistortion`, `TiltCard`, `ImageReveal`, `LensImage`, `Aurora`, `DotGrid`, `LiquidMetal`, `Particles`, `HalftoneImage`, `PixelImage`, `MeshGradient`, `Silk`, `Caustics`, `ContourLines`, `Starfield`, `Voronoi`, `GridFloor`, `InkSmoke`, `GlitchImage`, `DitherImage`, `AsciiImage`, `DuotoneImage`, `FogImage`, `KaleidoscopeImage`, `HoloCard`, `SpotlightCard`, `ShaderButton`, `ShaderText` and `CursorTrail`) and renders them on the client only, because WebGL only exists in the browser.

```bash
npm install @glimmerui/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@glimmerui/nuxt"],
  // Optional: glimmerui: { prefix: "Gl" } gives <GlTiltCard>.
});
```

```vue
<template>
  <TiltCard src="/photo.jpg" alt="Team photo" class="h-80" />
</template>
```
