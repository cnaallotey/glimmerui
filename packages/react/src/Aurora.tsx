import { forwardRef, type HTMLAttributes } from "react";
import { createAurora, type AuroraOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface AuroraProps extends AuroraOptions, HTMLAttributes<HTMLDivElement> {}

export const Aurora = forwardRef<HTMLDivElement, AuroraProps>(function Aurora(
  { colors, background, speed, intensity, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  // Colors are compared by value so inline arrays do not trigger an update.
  const { host, ctrl } = useController(createAurora, { colors, background, speed, intensity }, [
    colors?.join(","),
    background,
    speed,
    intensity,
  ]);

  return (
    <div
      ref={ref}
      {...rest}
      style={{ position: "relative", overflow: "hidden", ...style }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (isHoverPointer(e)) ctrl.current?.setIntensity(1);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        ctrl.current?.setIntensity(0);
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
