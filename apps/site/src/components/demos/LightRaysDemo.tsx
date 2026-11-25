import { LightRays } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#ffbe78"),
  color("background", "#0c0d14"),
  range("origin", 0.5, 0, 1, 0.05),
  range("spread", 1, 0.2, 2, 0.1),
  range("intensity", 1, 0, 2, 0.1),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  "Golden hour": {},
  Moonlight: { color: "#9fc5ff", background: "#070b16", origin: 0.2 },
  Stage: { color: "#ff5d8f", background: "#12060d", spread: 0.5, intensity: 1.6 },
};

export function LightRaysDemo() {
  return (
    <Demo
      name="LightRays"
      controls={controls}
      presets={presets}
      render={(p) => <LightRays className="demo-stage" {...p} />}
    />
  );
}
