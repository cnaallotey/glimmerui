import { Starfield } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#ffffff"),
  color("background", "#05040a"),
  range("density", 1, 0.3, 3, 0.1),
  range("speed", 1, 0, 4, 0.1),
];
const presets = {
  Night: {},
  Warp: { speed: 2.8, density: 1.6 },
  Dust: { color: "#fcd9a8", background: "#150d08", speed: 0.4, density: 2 },
};

export function StarfieldDemo() {
  return (
    <Demo
      name="Starfield"
      controls={controls}
      presets={presets}
      render={(p) => <Starfield className="demo-stage" {...p} />}
    />
  );
}
