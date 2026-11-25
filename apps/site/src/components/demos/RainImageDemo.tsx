import { RainImage } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("amount", 0.6, 0, 1, 0.05),
  range("speed", 1, 0, 3, 0.1),
  range("fog", 0.7, 0, 1, 0.05),
  color("tint", "#aeb6c2"),
  range("radius", 130, 40, 300, 10),
];
const presets = {
  Shower: {},
  Drizzle: { amount: 0.25, speed: 0.6, fog: 0.35 },
  Downpour: { amount: 1, speed: 1.8, fog: 0.9 },
};

export function RainImageDemo() {
  return (
    <Demo
      name="RainImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-alt.png", alt: "A warm dotted test pattern with a violet disc" }}
      render={(p) => <RainImage className="demo-stage" {...p} />}
    />
  );
}
