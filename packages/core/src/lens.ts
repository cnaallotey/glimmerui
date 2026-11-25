import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { lensFragment } from "./shaders";

export interface LensImageOptions extends ImageEffectBaseOptions {
  /** Magnification at the center of the lens. Defaults to 1.75. */
  zoom?: number;
  /** Lens radius in CSS pixels. Defaults to 96. */
  size?: number;
  /** Strength of the color fringing toward the rim, from 0 to 1. Defaults to 1. */
  fringe?: number;
}

export type LensImageController = ImageEffectController<LensImageOptions>;

export function createLensImage(
  container: HTMLElement,
  options: LensImageOptions
): LensImageController {
  return createImageEffect(container, options, {
    fragment: lensFragment,
    resolve: (o) => ({
      zoom: Math.max(1, o.zoom ?? 1.75),
      size: o.size ?? 96,
      fringe: o.fringe ?? 1,
    }),
    uniforms: (r) => ({ uZoom: r.zoom, uSize: r.size, uFringe: r.fringe }),
    // Stiff enough that the lens stays under the pointer.
    pointerSpring: { type: "spring", stiffness: 320, damping: 30 },
    hoverTransition: { type: "spring", stiffness: 200, damping: 22 },
  });
}
