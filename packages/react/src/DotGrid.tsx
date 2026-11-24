import { forwardRef, type HTMLAttributes } from "react";
import { createDotGrid, type DotGridOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface DotGridProps extends DotGridOptions, HTMLAttributes<HTMLDivElement> {}

export const DotGrid = forwardRef<HTMLDivElement, DotGridProps>(function DotGrid(
  { color, accent, spacing, size, radius, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  const { host, ctrl } = useController(createDotGrid, { color, accent, spacing, size, radius }, [
    color,
    accent,
    spacing,
    size,
    radius,
  ]);

  return (
    <div
      ref={ref}
      {...rest}
      style={{ position: "relative", overflow: "hidden", ...style }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (!isHoverPointer(e)) return;
        // Start from where the pointer came in, not from the center.
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
