import { LiquidMetal } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("count", 6, 1, 12, 1),
  color("tint", "#ffffff"),
  color("background", "#0e0d12"),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Chrome: {},
  Gold: { tint: "#ffcf6b", background: "#17100a" },
  Mercury: { count: 11, speed: 0.6, background: "#d9d8de" },
};

export function LiquidMetalDemo() {
  return (
    <Demo
      name="LiquidMetal"
      controls={controls}
      presets={presets}
      render={(p) => <LiquidMetal className="demo-stage" {...p} />}
    />
  );
}
