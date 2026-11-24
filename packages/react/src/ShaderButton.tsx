import { forwardRef, type ButtonHTMLAttributes } from "react";
import { createShaderButton, type ShaderButtonOptions } from "@glimmerui/core";
import { hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface ShaderButtonProps extends ShaderButtonOptions, ButtonHTMLAttributes<HTMLButtonElement> {}

export const ShaderButton = forwardRef<HTMLButtonElement, ShaderButtonProps>(function ShaderButton(
  { colors, speed, style, children, onPointerEnter, onPointerLeave, onPointerMove, onFocus, onBlur, ...rest },
  ref
) {
  const { host, ctrl } = useController(createShaderButton, { colors, speed }, [colors?.join(","), speed]);

  return (
    <button
      type="button"
      ref={ref}
      {...rest}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        border: 0,
        borderRadius: 999,
        padding: "0.8rem 1.5rem",
        background: "transparent",
        color: "#fff",
        font: "inherit",
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (!isHoverPointer(e)) return;
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
      // Keyboard focus lights the button up the same way hover does.
      onFocus={(e) => {
        onFocus?.(e);
        if (e.currentTarget.matches(":focus-visible")) {
          ctrl.current?.setPointer(0.5, 0.5);
          ctrl.current?.setHover(1);
        }
      }}
      onBlur={(e) => {
        onBlur?.(e);
        ctrl.current?.setHover(0);
      }}
    >
      <span ref={host} aria-hidden style={hostStyle} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
});
