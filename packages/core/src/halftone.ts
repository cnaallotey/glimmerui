import { Color } from "ogl";
import { createImageEffect, type ImageEffectBaseOptions, type ImageEffectController } from "./imageEffect";
import { halftoneFragment } from "./shaders";

export interface HalftoneImageOptions extends ImageEffectBaseOptions {
  /** Distance between dot centers, in CSS pixels. Defaults to 8. */
  cell?: number;
  /** Dot color, as a hex value. Defaults to near-black. */
  ink?: string;
  /** Paper color behind the dots, as a hex value. Defaults to off-white. */
  paper?: string;
  /** Radius of the full-color area around the pointer, in CSS pixels. Defaults to 140. */
  radius?: number;
}

export type HalftoneImageController = ImageEffectController<HalftoneImageOptions>;

export function createHalftoneImage(
  container: HTMLElement,
  options: HalftoneImageOptions
): HalftoneImageController {
  return createImageEffect(container, options, {
    fragment: halftoneFragment,
    resolve: (o) => ({
      cell: Math.max(2, o.cell ?? 8),
      ink: o.ink ?? "#0e0d12",
      paper: o.paper ?? "#fafafa",
      radius: o.radius ?? 140,
    }),
    uniforms: (r) => ({
      uCell: r.cell,
      uInk: new Color(r.ink),
      uPaper: new Color(r.paper),
      uRadius: r.radius,
    }),
  });
}
