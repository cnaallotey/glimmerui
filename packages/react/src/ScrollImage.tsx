import { forwardRef, type HTMLAttributes } from "react";
import { createScrollImage, type ScrollImageOptions } from "@glimmerui/core";
import { Content, hostStyle, useController } from "./shared";

export interface ScrollImageProps extends ScrollImageOptions, HTMLAttributes<HTMLDivElement> {
  /** Accessible description of the image. */
  alt: string;
}

export const ScrollImage = forwardRef<HTMLDivElement, ScrollImageProps>(function ScrollImage(
  { src, strength, split, video, paused, alt, style, children, ...rest },
  ref
) {
  const { host } = useController(
    createScrollImage,
    { src, strength, split, video, paused },
    [src, strength, split, video, paused]
  );

  return (
    <div
      role="img"
      aria-label={alt}
      ref={ref}
      {...rest}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <div ref={host} aria-hidden style={hostStyle} />
      <Content>{children}</Content>
    </div>
  );
});
