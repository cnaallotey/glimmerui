import { forwardRef, useRef, type HTMLAttributes } from "react";
import { createImageReveal, type ImageRevealOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface ImageRevealProps
  extends ImageRevealOptions,
    HTMLAttributes<HTMLDivElement> {
  /** Accessible description covering both images. */
  alt: string;
}

export const ImageReveal = forwardRef<HTMLDivElement, ImageRevealProps>(function ImageReveal(
  {
    src,
    revealSrc,
    alt,
    style,
    children,
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onPointerDown,
    ...rest
  },
  ref
) {
  const { host, ctrl } = useController(createImageReveal, { src, revealSrc }, [src, revealSrc]);
  // Touch has no hover, so a tap toggles the reveal instead.
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
