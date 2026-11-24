import { forwardRef, type HTMLAttributes } from "react";
import { createMeshGradient, type MeshGradientOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface MeshGradientProps extends MeshGradientOptions, HTMLAttributes<HTMLDivElement> {}

export const MeshGradient = forwardRef<HTMLDivElement, MeshGradientProps>(function MeshGradient(
  { colors, grain, speed, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  const { host, ctrl } = useController(createMeshGradient, { colors, grain, speed }, [colors?.join(","), grain, speed]);

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
