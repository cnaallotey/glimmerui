import { forwardRef, type HTMLAttributes } from "react";
import { createImageDistortion, type ImageDistortionOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface ImageDistortionProps
  extends ImageDistortionOptions,
    HTMLAttributes<HTMLDivElement> {
  /** Accessible description of the image. */
  alt: string;
}

export const ImageDistortion = forwardRef<HTMLDivElement, ImageDistortionProps>(
  function ImageDistortion(
    { src, strength, video, paused, alt, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
    ref
  ) {
    const { host, ctrl } = useController(
    createImageDistortion,
    { src, strength, video, paused },
    [src, strength, video, paused]
  );

    return (
      <div
        role="img"
        aria-label={alt}
        ref={ref}
        {...rest}
        style={{ position: "relative", overflow: "hidden", ...style }}
        onPointerEnter={(e) => {
          onPointerEnter?.(e);
          if (isHoverPointer(e)) ctrl.current?.setHover(1);
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e);
          ctrl.current?.setHover(0);
        }}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          ctrl.current?.setPointer(...pointerPosition(e));
        }}
      >
        <div ref={host} aria-hidden style={hostStyle} />
        <Content>{children}</Content>
      </div>
    );
  }
);
