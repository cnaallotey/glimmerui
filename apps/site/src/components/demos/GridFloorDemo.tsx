import { GridFloor } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#e0457b"),
  color("glow", "#f9b44c"),
  color("background", "#0e0d12"),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Arcade: {},
  Mint: { color: "#2dd4bf", glow: "#a7f3d0", background: "#04140f" },
  Blueprint: { color: "#60a5fa", glow: "#dbeafe", background: "#0a1a33", speed: 0.5 },
};

export function GridFloorDemo() {
  return (
    <Demo
      name="GridFloor"
      controls={controls}
      presets={presets}
      render={(p) => <GridFloor className="demo-stage" {...p} />}
    />
  );
}
