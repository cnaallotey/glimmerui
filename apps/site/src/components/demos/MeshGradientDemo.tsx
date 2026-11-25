import { MeshGradient } from "@glimmerui/react";
import { colors, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  colors("colors", ["#3b1d8f", "#e0457b", "#f9b44c", "#22d3ee"]),
  range("grain", 0.5, 0, 1, 0.05),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Festival: {},
  Meadow: { colors: ["#14532d", "#65a30d", "#fde047", "#38bdf8"] },
  Dusk: { colors: ["#1e1b4b", "#7c3aed", "#fb7185", "#fed7aa"], speed: 0.6 },
};

export function MeshGradientDemo() {
  return (
    <Demo
      name="MeshGradient"
      controls={controls}
      presets={presets}
      render={(p) => <MeshGradient className="demo-stage" {...p} />}
    />
  );
}
