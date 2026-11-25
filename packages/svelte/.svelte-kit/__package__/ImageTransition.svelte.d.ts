import { type ImageTransitionOptions, type TransitionImage } from "@glimmerui/core";
import type { EffectProps } from "./types.js";
declare const ImageTransition: import("svelte").Component<EffectProps<Omit<ImageTransitionOptions, "images"> & {
    /** The images or videos to move through, each with its accessible description. */
    images: TransitionImage[];
}>, {}, "ref">;
type ImageTransition = ReturnType<typeof ImageTransition>;
export default ImageTransition;
