import { forwardRef, type HTMLAttributes } from "react";
import { createTiltCard, type TiltCardOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface TiltCardProps extends TiltCardOptions, HTMLAttributes<HTMLDivElement> {
  /** Accessible description of the image. */
  alt: string;
}

export const TiltCard = forwardRef<HTMLDivElement, TiltCardProps>(function TiltCard(
  { src, maxTilt, radius, glare, alt, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  const { host, ctrl } = useController(createTiltCard, { src, maxTilt, radius, glare }, [
    src,
    maxTilt,
    radius,
    glare,
  ]);

  return (
    <div
      role="img"
      aria-label={alt}
      ref={ref}
      {...rest}
      style={{ position: "relative", ...style }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (isHoverPointer(e)) ctrl.current?.setHover(1);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        ctrl.current?.setHover(0);
        ctrl.current?.setPointer(0.5, 0.5);
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
