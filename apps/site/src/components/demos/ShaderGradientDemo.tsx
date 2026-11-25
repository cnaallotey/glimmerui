import { ShaderGradient } from "@glimmerui/react";
import { colors, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  colors("colors", ["#3b1d8f", "#e0457b", "#f9b44c"]),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Sunset: {},
  Lagoon: { colors: ["#0f766e", "#22d3ee", "#a7f3d0"] },
  Ember: { colors: ["#7c2d12", "#f97316", "#fde68a"] },
  Graphite: { colors: ["#121117", "#9ea0a8", "#f4f4f6"], speed: 0.6 },
};

export function ShaderGradientDemo() {
  return (
    <Demo
      name="ShaderGradient"
      controls={controls}
      presets={presets}
      render={(p) => <ShaderGradient className="demo-stage" {...p} />}
    />
  );
}
