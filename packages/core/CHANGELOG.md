# @glimmerui/core

## 0.1.1

### Patch Changes

- 4c7e44b: Fix hard seams that could appear along the noise grid, most visibly as vertical edges in Aurora's curtains. Some GPU drivers computed a shared grid point differently from each neighbouring cell. ContourLines, Voronoi, Caustics and every other effect built on `noiseChunk` get the same fix. `noiseChunk` now also provides `gridPoint()`: wrap grid points in it before hashing them in your own shaders.

## 0.1.0

### Minor Changes

- d52e17f: First release of Glimmer UI: `ShaderGradient`, `ImageDistortion`, `TiltCard`, `ImageReveal`, `LensImage`, `Aurora`, `DotGrid`, `LiquidMetal`, `Particles`, `HalftoneImage`, `PixelImage`, `MeshGradient`, `Silk`, `Caustics`, `ContourLines`, `Starfield`, `Voronoi`, `GridFloor`, `InkSmoke`, `GlitchImage`, `DitherImage`, `AsciiImage`, `DuotoneImage`, `FogImage`, `KaleidoscopeImage`, `HoloCard`, `SpotlightCard`, `ShaderButton`, `ShaderText` and `CursorTrail` for React, Vue and Nuxt, sharing one WebGL context per page.
