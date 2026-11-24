import { forwardRef, type HTMLAttributes } from "react";
import { createShaderGradient, type ShaderGradientOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface ShaderGradientProps
  extends ShaderGradientOptions,
    HTMLAttributes<HTMLDivElement> {}

export const ShaderGradient = forwardRef<HTMLDivElement, ShaderGradientProps>(
  function ShaderGradient(
    { colors, speed, intensity, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
    ref
  ) {
    // Colors are compared by value so inline arrays do not trigger an update.
    const { host, ctrl } = useController(createShaderGradient, { colors, speed, intensity }, [
      colors?.join(","),
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
  }
);
