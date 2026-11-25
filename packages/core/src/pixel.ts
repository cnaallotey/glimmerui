import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { pixelFragment } from "./shaders";

export interface PixelImageOptions extends ImageEffectBaseOptions {
  /** Block size away from the pointer, in CSS pixels. Defaults to 32. */
  block?: number;
  /** Radius of the sharp area around the pointer, in CSS pixels. Defaults to 180. */
  radius?: number;
}

export type PixelImageController = ImageEffectController<PixelImageOptions>;

export function createPixelImage(
  container: HTMLElement,
  options: PixelImageOptions
): PixelImageController {
  return createImageEffect(container, options, {
    fragment: pixelFragment,
    resolve: (o) => ({ block: Math.max(1, o.block ?? 32), radius: o.radius ?? 180 }),
    uniforms: (r) => ({ uBlock: r.block, uRadius: r.radius }),
  });
}
