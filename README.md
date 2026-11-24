# Glimmer UI

Open source WebGL UI components for React, Vue and Nuxt, animated with Motion.

## How it works

`@glimmerui/core` holds the WebGL effects (built on OGL) and is framework agnostic. Pointer and hover input is smoothed with Motion values and fed into shader uniforms. `@glimmerui/react` and `@glimmerui/vue` are thin wrappers, so both frameworks get the same effects from one codebase.

## Components

| Component | What it does |
| --- | --- |
| `ShaderGradient` | Animated gradient background that bends around the pointer |
| `ImageDistortion` | Image with a pointer driven ripple and color split on hover |
| `TiltCard` | Image card that tilts in true perspective toward the pointer, with glare and rounded corners |
| `ImageReveal` | Two images; hovering dissolves from one to the other through an edge that spreads from the pointer |
| `LensImage` | Image with a round glass lens that follows the pointer and magnifies what's under it |
| `Aurora` | Night-sky background of flowing curtains of light that the pointer stirs |
| `DotGrid` | Background of dots that swell and part around the pointer |
| `LiquidMetal` | Background of chrome blobs that drift and merge, with one that follows the pointer |
| `Particles` | Background of drifting points that gather and swirl around the pointer |
| `HalftoneImage` | Image printed as a halftone of dots that opens into full color around the pointer |
| `PixelImage` | Image shown as a coarse mosaic that sharpens around the pointer |
| `MeshGradient` | Four colors blended across a softly warping surface, with film grain |
| `Silk` | Flowing folds of satin with a sheen along each crest |
| `Caustics` | The shifting web of light on the floor of a pool |
| `ContourLines` | A shifting topographic map whose lines ring around the pointer |
| `Starfield` | A flight through stars that streak past |
| `Voronoi` | Stained glass of drifting cells that light up near the pointer |
| `GridFloor` | A glowing perspective grid rolling toward you under a horizon glow |
| `InkSmoke` | A plume of smoke that rises from the pointer |
| `GlitchImage` | An image that breaks into a digital glitch on hover |
| `DitherImage` | An image in one-bit ordered dither with full color around the pointer |
| `AsciiImage` | An image drawn in text characters, with the real image around the pointer |
| `DuotoneImage` | A two-color print whose original colors spread from the pointer |
| `FogImage` | An image behind frosted glass that the pointer wipes clear |
| `KaleidoscopeImage` | An image folded into turning mirrored wedges |
| `HoloCard` | A tilt card with a holographic foil that shifts as it tilts |
| `SpotlightCard` | A card whose border lights up near the pointer |
| `ShaderButton` | A button with a live, flowing color fill |
| `ShaderText` | Text filled with flowing color that stays real, selectable text |
| `CursorTrail` | A glowing trail that follows the mouse across the page |

## Packages

| Package | Purpose |
| --- | --- |
| `@glimmerui/core` | Shader effects and the Motion powered controllers |
| `@glimmerui/react` | React components |
| `@glimmerui/vue` | Vue components |
| `@glimmerui/nuxt` | Nuxt module that auto-imports the Vue components, client only |

## Install

```bash
npm install @glimmerui/react   # React
npm install @glimmerui/vue     # Vue
npm install @glimmerui/nuxt    # Nuxt
```

## Usage

React (the bundle is marked `"use client"`, so it works in the Next.js App Router):

```tsx
import { ShaderGradient, ImageDistortion } from "@glimmerui/react";

<ShaderGradient colors={["#3b1d8f", "#e0457b", "#f9b44c"]} className="h-64">
  <h1>Hello</h1>
</ShaderGradient>

<ImageDistortion src="/photo.jpg" alt="Team photo" className="h-80" />
```

Vue:

```vue
<script setup>
import { ShaderGradient, ImageDistortion } from "@glimmerui/vue";
</script>

<template>
  <ShaderGradient :colors="['#3b1d8f', '#e0457b', '#f9b44c']" class="h-64">
    <h1>Hello</h1>
  </ShaderGradient>

  <ImageDistortion src="/photo.jpg" alt="Team photo" class="h-80" />
</template>
```

Nuxt: add the module and use the components anywhere, without imports. They render on the client only, because WebGL only exists in the browser.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@glimmerui/nuxt"],
  // Optional: glimmerui: { prefix: "Gl" } gives <GlTiltCard>.
});
```

Every component passes other attributes (`id`, `style`, `data-*`, `aria-*`, event handlers) to its root element, and the React components forward `ref` to it. Hover effects respond to mouse and pen, not touch.

Image sources must be same origin or served with CORS headers, because WebGL cannot read cross origin pixels otherwise.

## Principles

1. Every component falls back to plain CSS when WebGL is unavailable.
2. Animation pauses offscreen and respects `prefers-reduced-motion`. With reduced motion you get a still frame that updates only on input.
3. The canvas lives in its own host element, so React and Vue never reconcile it.
4. Shared plumbing (context, resize, visibility, cleanup) lives in one `createStage` helper, so a new effect only describes its scene.

## Development

```bash
pnpm install
pnpm build
pnpm typecheck

# Each dev script builds the packages it uses first.

pnpm --filter react-playground dev
pnpm --filter vue-playground dev
pnpm --filter nuxt-playground dev

# Marketing site and docs (Astro + Starlight), at http://localhost:4321
pnpm --filter site dev
```

The site lives in `apps/site`. The landing page is `src/pages/index.astro`, and the docs are MDX files in `src/content/docs/docs/`. Live demos in the docs are React islands in `src/components/demos/`.

## Adding an effect

1. Write the shader in `packages/core/src/shaders.ts`.
2. Add a `create...` function in `packages/core/src` that builds a program and calls `createStage`. Drive inputs with `animateTo` and `bindValue` so reduced motion works, and give the controller an `update(options)` that changes uniforms in place instead of rebuilding.
3. Export it from `packages/core/src/index.ts`.
4. Add a thin wrapper in `packages/react` and `packages/vue` that creates the effect once and passes later prop changes to `update`, then a demo in each playground.

## Shared context

Browsers allow roughly 16 WebGL contexts per page. Glimmer uses one offscreen context for every effect and copies each result into a plain 2D canvas inside its component, so a page can hold any number of effects. This keeps normal DOM stacking, so text and children sit above the effect. Try `apps/react-playground` with `?stress=24`.

## Releasing

Versions and changelogs are managed with [Changesets](https://changesets.dev). The four `@glimmerui/*` packages always share one version.

1. In a pull request that changes a package, run `pnpm changeset` and describe the change.
2. When it merges, the Release workflow opens or updates a "Version packages" pull request that bumps versions and writes the changelogs.
3. Merging that pull request publishes to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is stored in GitHub, and creates git tags and GitHub releases.

### One-time setup

npm only lets you add a trusted publisher to a package that already exists, so the first release is published by hand.

1. Create the `glimmerui` organization on npmjs.com.
2. Add a `repository` field pointing at the GitHub repository to each `packages/*/package.json`. npm checks it against the workflow when it adds provenance.
3. In the GitHub repository, under Settings, Actions, General, enable "Allow GitHub Actions to create and approve pull requests".
4. Publish the first version from your machine:

   ```bash
   npm login
   pnpm version-packages   # applies .changeset/initial-release.md: 0.0.0 to 0.1.0
   git commit -am "Release 0.1.0"
   pnpm release            # builds and publishes the four packages
   git push --follow-tags
   ```

5. On npmjs.com, open each package's settings and add a GitHub Actions trusted publisher with your repository and the workflow file `release.yml`. Then, under "Publishing access", disallow tokens.

From then on, releases go out through the workflow.

## Known limits

If the browser drops the shared WebGL context (for example after a GPU reset), effects stop updating until the page reloads. Recovery is not implemented yet.

## License

MIT
