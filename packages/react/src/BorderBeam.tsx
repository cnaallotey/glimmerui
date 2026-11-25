import { forwardRef, type HTMLAttributes } from "react";
import { createBorderBeam, type BorderBeamOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface BorderBeamProps extends BorderBeamOptions, HTMLAttributes<HTMLDivElement> {}

export const BorderBeam = forwardRef<HTMLDivElement, BorderBeamProps>(function BorderBeam(
  { color, tail, background, radius, border, length, beams, speed, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  const { host, ctrl } = useController(
    createBorderBeam,
    { color, tail, background, radius, border, length, beams, speed },
    [color, tail, background, radius, border, length, beams, speed]
  );

  return (
    <div
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
});
