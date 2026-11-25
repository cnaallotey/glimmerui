import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { distortionFragment } from "./shaders";

export interface ImageDistortionOptions extends ImageEffectBaseOptions {
  /** Ripple and color split strength. 1 is the default. */
  strength?: number;
}

export type ImageDistortionController = ImageEffectController<ImageDistortionOptions>;

export function createImageDistortion(
  container: HTMLElement,
  options: ImageDistortionOptions
): ImageDistortionController {
  return createImageEffect(container, options, {
    fragment: distortionFragment,
    resolve: (o) => ({ strength: o.strength ?? 1 }),
    uniforms: (r) => ({ uStrength: r.strength }),
    pointerSpring: { type: "spring", stiffness: 140, damping: 18 },
    hoverTransition: { type: "spring", stiffness: 90, damping: 14 },
  });
}
