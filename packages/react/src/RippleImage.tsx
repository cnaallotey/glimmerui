import { forwardRef, type HTMLAttributes } from "react";
import { createRippleImage, type RippleImageOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface RippleImageProps extends RippleImageOptions, HTMLAttributes<HTMLDivElement> {
  /** Accessible description of the image. */
  alt: string;
}

export const RippleImage = forwardRef<HTMLDivElement, RippleImageProps>(function RippleImage(
  { src, strength, speed, video, paused, alt, style, children, onPointerEnter, onPointerLeave, onPointerMove, onPointerDown, ...rest },
  ref
) {
  const { host, ctrl } = useController(
    createRippleImage,
    { src, strength, speed, video, paused },
    [src, strength, speed, video, paused]
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
        if (!isHoverPointer(e)) return;
        // Start where the pointer came in, not at the center.
        ctrl.current?.setPointer(...pointerPosition(e));
        ctrl.current?.setHover(1);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        if (isHoverPointer(e)) ctrl.current?.setHover(0);
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        ctrl.current?.setPointer(...pointerPosition(e));
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        // A click or tap drops a bigger stone.
        ctrl.current?.drop(...pointerPosition(e));
      }}
    >
      <div ref={host} aria-hidden style={hostStyle} />
      <Content>{children}</Content>
    </div>
  );
});
