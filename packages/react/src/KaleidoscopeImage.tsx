import { forwardRef, useRef, type HTMLAttributes } from "react";
import { createKaleidoscopeImage, type KaleidoscopeImageOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface KaleidoscopeImageProps extends KaleidoscopeImageOptions, HTMLAttributes<HTMLDivElement> {
  /** Accessible description of the image. */
  alt: string;
}

export const KaleidoscopeImage = forwardRef<HTMLDivElement, KaleidoscopeImageProps>(function KaleidoscopeImage(
  { src, segments, speed, video, paused, alt, style, children, onPointerEnter, onPointerLeave, onPointerMove, onPointerDown, ...rest },
  ref
) {
  const { host, ctrl } = useController(
    createKaleidoscopeImage,
    { src, segments, speed, video, paused },
    [src, segments, speed, video, paused]
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
      onPointerMove={(e) => {
        onPointerMove?.(e);
        ctrl.current?.setPointer(...pointerPosition(e));
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (isHoverPointer(e)) return;
        tapped.current = !tapped.current;
        ctrl.current?.setPointer(...pointerPosition(e));
        ctrl.current?.setHover(tapped.current ? 1 : 0);
      }}
    >
      <div ref={host} aria-hidden style={hostStyle} />
      <Content>{children}</Content>
    </div>
  );
});
