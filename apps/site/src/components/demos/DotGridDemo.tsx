import { DotGrid } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#8f8bab"),
  color("accent", "#e0457b"),
  range("spacing", 24, 10, 48, 1),
  range("size", 1.5, 0.5, 5, 0.25),
  range("radius", 140, 40, 320, 10),
];
const presets = {
  Quiet: {},
  Bold: { spacing: 32, size: 4, color: "#3b1d8f" },
  Fine: { spacing: 12, size: 0.75, radius: 220 },
};

export function DotGridDemo() {
  return (
    <Demo
      name="DotGrid"
      controls={controls}
      presets={presets}
      render={(p) => <DotGrid className="demo-stage" {...p} />}
    />
  );
}
