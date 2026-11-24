import { forwardRef, useRef, type HTMLAttributes } from "react";
import { createShaderText, type ShaderTextOptions } from "@glimmerui/core";
import { hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface ShaderTextProps extends ShaderTextOptions, Omit<HTMLAttributes<HTMLSpanElement>, "children"> {}

/**
 * Text filled with flowing color. The real text stays in the page, transparent
 * but selectable and read by screen readers; the effect draws behind it.
 */
export const ShaderText = forwardRef<HTMLSpanElement, ShaderTextProps>(function ShaderText(
  { text, colors, speed, style, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  const textRef = useRef<HTMLSpanElement>(null);
  const { host, ctrl } = useController(
    (el, options) => createShaderText(el, options, textRef.current ?? undefined),
    { text, colors, speed },
    [text, colors?.join(","), speed]
  );

  return (
    <span
      ref={ref}
      {...rest}
      style={{ position: "relative", display: "inline-block", ...style }}
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
    >
      <span ref={host} aria-hidden style={hostStyle} />
      <span ref={textRef} style={{ position: "relative", zIndex: 1, color: "transparent", whiteSpace: "pre" }}>
        {text}
      </span>
    </span>
  );
});
