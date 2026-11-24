import { forwardRef, type HTMLAttributes } from "react";
import { createSpotlightCard, type SpotlightCardOptions } from "@glimmerui/core";
import { Content, hostStyle, isHoverPointer, pointerPosition, useController } from "./shared";

export interface SpotlightCardProps extends SpotlightCardOptions, HTMLAttributes<HTMLDivElement> {}

export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(function SpotlightCard(
  { color, background, radius, border, style, children, onPointerEnter, onPointerLeave, onPointerMove, ...rest },
  ref
) {
  const { host, ctrl } = useController(createSpotlightCard, { color, background, radius, border }, [color, background, radius, border]);

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
