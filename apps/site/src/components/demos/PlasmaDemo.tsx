import { Plasma } from "@glimmerui/react";
import { color, colors, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  colors("colors", ["#3b1d8f", "#e0457b", "#ffe9c9"]),
  color("background", "#0a0812"),
  range("scale", 1, 0.3, 2.5, 0.1),
  range("intensity", 1, 0, 2, 0.1),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Violet: {},
  Electric: { colors: ["#0b3bff", "#22d3ee", "#f0fdff"], background: "#04081a" },
  Lava: { colors: ["#7f1d1d", "#f97316", "#fef08a"], background: "#120503", scale: 0.7 },
};

export function PlasmaDemo() {
  return (
    <Demo
      name="Plasma"
      controls={controls}
      presets={presets}
      render={(p) => <Plasma className="demo-stage" {...p} />}
    />
  );
}
