import { Particles } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("count", 2500, 250, 10000, 250),
  color("color", "#8b8a94"),
  color("accent", "#e0457b"),
  range("size", 2, 1, 6, 0.25),
  range("radius", 160, 40, 400, 10),
];
const presets = {
  Dust: {},
  Swarm: { count: 7000, size: 1.5 },
  Confetti: { count: 900, size: 5, color: "#f9b44c", accent: "#3b1d8f", radius: 260 },
};

export function ParticlesDemo() {
  return (
    <Demo
      name="Particles"
      controls={controls}
      presets={presets}
      render={(p) => <Particles className="demo-stage" {...p} />}
    />
  );
}
