import { createRequire } from "node:module";
import { addComponent, defineNuxtModule } from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";

export interface ModuleOptions {
  /** Prefix for the auto-imported component names. "Gl" gives <GlTiltCard>. */
  prefix: string;
}

const components = [
  "ShaderGradient",
  "ImageDistortion",
  "TiltCard",
  "ImageReveal",
  "DotGrid",
  "Aurora",
  "LensImage",
  "LiquidMetal",
  "Particles",
  "HalftoneImage",
  "PixelImage",
  "MeshGradient",
  "Silk",
  "Caustics",
  "ContourLines",
  "Starfield",
  "Voronoi",
  "GridFloor",
  "InkSmoke",
  "GlitchImage",
  "DitherImage",
  "AsciiImage",
  "DuotoneImage",
  "FogImage",
  "KaleidoscopeImage",
  "HoloCard",
  "SpotlightCard",
  "ShaderButton",
  "ShaderText",
  "CursorTrail",
] as const;

// Annotated so the published types reference @nuxt/schema by name.
const glimmerModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@glimmerui/nuxt",
    configKey: "glimmerui",
    compatibility: { nuxt: ">=3.16.0" },
  },
  defaults: { prefix: "" },
  setup(options) {
    // Resolved from this package, so apps only need @glimmerui/nuxt installed.
    const filePath = createRequire(import.meta.url).resolve("@glimmerui/vue");
    for (const name of components) {
      addComponent({
        name: `${options.prefix}${name}`,
        export: name,
        filePath,
        // WebGL only exists in the browser, so render on the client only.
        mode: "client",
      });
    }
  },
});

export default glimmerModule;
