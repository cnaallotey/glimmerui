# @glimmerui/vue

WebGL UI components for Vue from Glimmer UI: `ShaderGradient`, `ImageDistortion`, `TiltCard`, `ImageReveal`, `LensImage`, `Aurora`, `DotGrid`, `LiquidMetal`, `Particles`, `HalftoneImage`, `PixelImage`, `MeshGradient`, `Silk`, `Caustics`, `ContourLines`, `Starfield`, `Voronoi`, `GridFloor`, `InkSmoke`, `GlitchImage`, `DitherImage`, `AsciiImage`, `DuotoneImage`, `FogImage`, `KaleidoscopeImage`, `HoloCard`, `SpotlightCard`, `ShaderButton`, `ShaderText`, `CursorTrail`, `ImageTransition`, `ScrollImage`, `RippleImage`, `RainImage`, `LightRays`, `Plasma` and `BorderBeam`. For Nuxt, use `@glimmerui/nuxt`.

```bash
npm install @glimmerui/vue
```

```vue
<script setup>
import { ShaderGradient, TiltCard } from "@glimmerui/vue";
</script>

<template>
  <ShaderGradient :colors="['#3b1d8f', '#e0457b', '#f9b44c']" class="h-64">
    <h1>Hello</h1>
  </ShaderGradient>
  <TiltCard src="/photo.jpg" alt="Team photo" class="h-80" />
</template>
```

Attributes and listeners pass through to the root element. Images and videos must be same origin or served with CORS headers.

`useScrollProgress(element)` gives an element's scroll progress, to drive any prop.
