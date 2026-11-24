# @glimmerui/react

WebGL UI components for React from Glimmer UI: `ShaderGradient`, `ImageDistortion`, `TiltCard`, `ImageReveal`, `LensImage`, `Aurora`, `DotGrid`, `LiquidMetal`, `Particles`, `HalftoneImage`, `PixelImage`, `MeshGradient`, `Silk`, `Caustics`, `ContourLines`, `Starfield`, `Voronoi`, `GridFloor`, `InkSmoke`, `GlitchImage`, `DitherImage`, `AsciiImage`, `DuotoneImage`, `FogImage`, `KaleidoscopeImage`, `HoloCard`, `SpotlightCard`, `ShaderButton`, `ShaderText` and `CursorTrail`.

```bash
npm install @glimmerui/react
```

```tsx
import { ShaderGradient, TiltCard } from "@glimmerui/react";

<ShaderGradient colors={["#3b1d8f", "#e0457b", "#f9b44c"]} className="h-64">
  <h1>Hello</h1>
</ShaderGradient>

<TiltCard src="/photo.jpg" alt="Team photo" className="h-80" />
```

Components forward `ref` and other attributes to their root `div`. The bundle is marked `"use client"`, so it works in the Next.js App Router. Images must be same origin or served with CORS headers.
