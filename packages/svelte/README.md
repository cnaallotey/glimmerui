# @glimmerui/svelte

WebGL UI components for Svelte 5 and SvelteKit from Glimmer UI: `ShaderGradient`, `ImageDistortion`, `TiltCard`, `ImageReveal`, `LensImage`, `Aurora`, `DotGrid`, `LiquidMetal`, `Particles`, `HalftoneImage`, `PixelImage`, `MeshGradient`, `Silk`, `Caustics`, `ContourLines`, `Starfield`, `Voronoi`, `GridFloor`, `InkSmoke`, `GlitchImage`, `DitherImage`, `AsciiImage`, `DuotoneImage`, `FogImage`, `KaleidoscopeImage`, `HoloCard`, `SpotlightCard`, `ShaderButton`, `ShaderText`, `CursorTrail`, `ImageTransition`, `ScrollImage`, `RippleImage`, `RainImage`, `LightRays`, `Plasma` and `BorderBeam`.

```bash
npm install @glimmerui/svelte
```

```svelte
<script>
  import { ShaderGradient, TiltCard } from "@glimmerui/svelte";
</script>

<ShaderGradient colors={["#3b1d8f", "#e0457b", "#f9b44c"]} class="h-64">
  <h1>Hello</h1>
</ShaderGradient>

<TiltCard src="/photo.jpg" alt="Team photo" class="h-80" />
```

Attributes and listeners pass through to the root element, and `bind:ref` gives you that element. The components render on the server and start in the browser. Images and videos must be same origin or served with CORS headers.

The `scrollProgress` action reports an element's scroll progress, to drive any prop.
