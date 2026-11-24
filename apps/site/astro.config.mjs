// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    react(),
    starlight({
      title: "Glimmer UI",
      description: "WebGL components for React, Vue and Nuxt.",
      logo: { src: "./src/assets/logo.svg" },
      favicon: "/favicon.svg",
      customCss: [
        "@fontsource-variable/geist",
        "@fontsource-variable/geist-mono",
        "./src/styles/tokens.css",
        "./src/styles/docs.css",
      ],
      social: [
        { icon: "npm", label: "npm", href: "https://www.npmjs.com/org/glimmerui" },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Introduction", slug: "docs" },
            { label: "Installation", slug: "docs/installation" },
            { label: "React", slug: "docs/react" },
            { label: "Vue", slug: "docs/vue" },
            { label: "Nuxt", slug: "docs/nuxt" },
          ],
        },
        {
          label: "Components",
          items: [
            { label: "ShaderGradient", slug: "docs/components/shader-gradient" },
            { label: "ImageDistortion", slug: "docs/components/image-distortion" },
            { label: "TiltCard", slug: "docs/components/tilt-card" },
            { label: "ImageReveal", slug: "docs/components/image-reveal" },
            { label: "LensImage", slug: "docs/components/lens-image" },
            { label: "Aurora", slug: "docs/components/aurora" },
            { label: "DotGrid", slug: "docs/components/dot-grid" },
            { label: "LiquidMetal", slug: "docs/components/liquid-metal" },
            { label: "Particles", slug: "docs/components/particles" },
            { label: "HalftoneImage", slug: "docs/components/halftone-image" },
            { label: "PixelImage", slug: "docs/components/pixel-image" },
            { label: "MeshGradient", slug: "docs/components/mesh-gradient" },
            { label: "Silk", slug: "docs/components/silk" },
            { label: "Caustics", slug: "docs/components/caustics" },
            { label: "ContourLines", slug: "docs/components/contour-lines" },
            { label: "Starfield", slug: "docs/components/starfield" },
            { label: "Voronoi", slug: "docs/components/voronoi" },
            { label: "GridFloor", slug: "docs/components/grid-floor" },
            { label: "InkSmoke", slug: "docs/components/ink-smoke" },
            { label: "GlitchImage", slug: "docs/components/glitch-image" },
            { label: "DitherImage", slug: "docs/components/dither-image" },
            { label: "AsciiImage", slug: "docs/components/ascii-image" },
            { label: "DuotoneImage", slug: "docs/components/duotone-image" },
            { label: "FogImage", slug: "docs/components/fog-image" },
            { label: "KaleidoscopeImage", slug: "docs/components/kaleidoscope-image" },
            { label: "HoloCard", slug: "docs/components/holo-card" },
            { label: "SpotlightCard", slug: "docs/components/spotlight-card" },
            { label: "ShaderButton", slug: "docs/components/shader-button" },
            { label: "ShaderText", slug: "docs/components/shader-text" },
            { label: "CursorTrail", slug: "docs/components/cursor-trail" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Accessibility", slug: "docs/guides/accessibility" },
            { label: "Performance", slug: "docs/guides/performance" },
            { label: "Server rendering", slug: "docs/guides/server-rendering" },
            { label: "Images and CORS", slug: "docs/guides/images" },
            { label: "Core API", slug: "docs/guides/core-api" },
          ],
        },
      ],
    }),
  ],
});
