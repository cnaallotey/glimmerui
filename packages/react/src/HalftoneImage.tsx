import { forwardRef, useRef, type HTMLAttributes } from "react";
import { createHalftoneImage, type HalftoneImageOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface HalftoneImageProps extends HalftoneImageOptions, HTMLAttributes<HTMLDivElement> {
  /** Accessible description of the image. */
  alt: string;
}

export const HalftoneImage = forwardRef<HTMLDivElement, HalftoneImageProps>(function HalftoneImage(
  { src, cell, ink, paper, radius, video, paused, alt, style, children, onPointerEnter, onPointerLeave, onPointerMove, onPointerDown, ...rest },
  ref
) {
  const { host, ctrl } = useController(
    createHalftoneImage,
    { src, cell, ink, paper, radius, video, paused },
    [src, cell, ink, paper, radius, video, paused]
  );

  // Touch has no hover, so a tap toggles the effect around the tapped point.
  const tapped = useRef(false);

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
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (isHoverPointer(e)) return;
        tapped.current = !tapped.current;
        ctrl.current?.setPointer(...pointerPosition(e));
        ctrl.current?.setHover(tapped.current ? 1 : 0);
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
});
