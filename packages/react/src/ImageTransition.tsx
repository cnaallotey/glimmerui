import { forwardRef, type HTMLAttributes } from "react";
import {
  createImageTransition,
  transitionLabel,
  type ImageTransitionOptions,
  type TransitionImage,
} from "@glimmerui/core";
import { Content, hostStyle, useController } from "./shared";

export interface ImageTransitionProps
  extends Omit<ImageTransitionOptions, "images">,
    HTMLAttributes<HTMLDivElement> {
  /** The images or videos to move through, each with its accessible description. */
  images: TransitionImage[];
}

export const ImageTransition = forwardRef<HTMLDivElement, ImageTransitionProps>(function ImageTransition(
  { images, index, effect, duration, scroll, progress, video, paused, style, children, ...rest },
  ref
) {
  const sources = images.map((image) => image.src);
  const { host } = useController(
    createImageTransition,
    { images: sources, index, effect, duration, scroll, progress, video, paused },
    [sources.join("\n"), index, effect, duration, scroll, progress, video, paused]
  );

  return (
    <div
      role="img"
      aria-label={transitionLabel(images, { index, scroll, progress })}
      ref={ref}
      {...rest}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <div ref={host} aria-hidden style={hostStyle} />
      <Content>{children}</Content>
    </div>
  );
});
