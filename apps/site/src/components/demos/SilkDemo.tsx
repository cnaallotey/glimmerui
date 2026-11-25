import { Silk } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#3b1d8f"),
  color("sheen", "#f4f4f6"),
  range("folds", 1, 0.3, 3, 0.1),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Violet: {},
  Emerald: { color: "#065f46", sheen: "#a7f3d0" },
  Champagne: { color: "#a3795b", sheen: "#fff4e0", folds: 1.6 },
};

export function SilkDemo() {
  return (
    <Demo
      name="Silk"
      controls={controls}
      presets={presets}
      render={(p) => <Silk className="demo-stage" {...p} />}
    />
  );
}
