<template>
  <!-- @glimmerui/nuxt auto-imports these and renders them on the client only. -->
  <ShaderGradient class="card">
    <h1>Glimmer on Nuxt</h1>
  </ShaderGradient>
  <ShaderGradient class="card" :colors="['#0f766e', '#22d3ee', '#a7f3d0']" :speed="1.5">
    <h1>Another palette</h1>
  </ShaderGradient>
  <ImageDistortion class="card" src="/demo.png" alt="Demo artwork" />
  <TiltCard class="card" src="/demo.png" alt="Demo artwork" />
  <ImageReveal class="card" src="/demo.png" reveal-src="/demo-alt.png" alt="Two test patterns" />
  <LensImage class="card" src="/demo-alt.png" alt="Warm test pattern" />
  <Aurora class="card">
    <h1>Aurora</h1>
  </Aurora>
  <DotGrid class="card" style="background: #f1f3f7">
    <h1 style="color: #1a1538">DotGrid</h1>
  </DotGrid>
  <LiquidMetal class="card">
    <h1>LiquidMetal</h1>
  </LiquidMetal>
  <Particles class="card" style="background: #fafafa">
    <h1 style="color: #0e0d12">Particles</h1>
  </Particles>
  <HalftoneImage class="card" src="/demo-spheres.png" alt="Spheres as a halftone" />
  <PixelImage class="card" src="/demo-spheres.png" alt="Spheres as a mosaic" />
  <MeshGradient class="card"><h1>MeshGradient</h1></MeshGradient>
  <Silk class="card"><h1>Silk</h1></Silk>
  <Caustics class="card"><h1>Caustics</h1></Caustics>
  <ContourLines class="card" style="background: #fafafa"><h1 style="color: #0e0d12">ContourLines</h1></ContourLines>
  <Starfield class="card"><h1>Starfield</h1></Starfield>
  <Voronoi class="card"><h1>Voronoi</h1></Voronoi>
  <GridFloor class="card"><h1>GridFloor</h1></GridFloor>
  <InkSmoke class="card"><h1>InkSmoke</h1></InkSmoke>
  <GlitchImage class="card" src="/demo-spheres.png" alt="Spheres, glitching" />
  <DitherImage class="card" src="/demo-spheres.png" alt="Spheres in dither" />
  <AsciiImage class="card" src="/demo-spheres.png" alt="Spheres in text" />
  <DuotoneImage class="card" src="/demo-spheres.png" alt="Spheres in duotone" />
  <FogImage class="card" src="/demo-spheres.png" alt="Spheres behind fog" />
  <KaleidoscopeImage class="card" src="/demo.png" alt="Kaleidoscope pattern" />
  <HoloCard class="card" src="/demo-spheres.png" alt="Holographic card" />
  <SpotlightCard class="card" style="background: #0e0d12; padding: 24px"><h1>SpotlightCard</h1></SpotlightCard>
  <div class="card" style="background: #0e0d12"><ShaderButton>ShaderButton</ShaderButton></div>
  <div class="card" style="background: #0e0d12"><h1><ShaderText text="ShaderText" /></h1></div>
  <CursorTrail />
</template>
