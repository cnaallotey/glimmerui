import { Aurora } from "@glimmerui/react";
import { color, colors, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  colors("colors", ["#2dd4bf", "#a3e635", "#a855f7"]),
  color("background", "#0b1026"),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Northern: {},
  Violet: { colors: ["#818cf8", "#e879f9", "#f472b6"], background: "#120a24" },
  Ember: { colors: ["#fb923c", "#f43f5e", "#facc15"], background: "#160a0a" },
};

export function AuroraDemo() {
  return (
    <Demo
      name="Aurora"
      controls={controls}
      presets={presets}
      render={(p) => <Aurora className="demo-stage" {...p} />}
    />
  );
}
